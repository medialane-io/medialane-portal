import { AddContractForm } from "./add-contract-form";
import { ContractActions } from "./contract-actions";

const BACKEND_URL = process.env.MEDIALANE_API_URL!;
const ADMIN_KEY = process.env.ADMIN_API_KEY!;

interface ServiceCatalogEntry {
  id: string;
  displayName: string;
  standard: string;
}

interface ServiceContract {
  id: string;
  serviceId: string;
  chain: string;
  contractAddress: string;
  startBlock: string;
  active: boolean;
  notes: string | null;
  createdAt: string;
}

async function getData(): Promise<{
  catalog: ServiceCatalogEntry[];
  contracts: ServiceContract[];
}> {
  const h = { "x-api-key": ADMIN_KEY };
  const [catalogRes, contractsRes] = await Promise.all([
    fetch(`${BACKEND_URL}/admin/services/catalog`, { headers: h, cache: "no-store" }),
    fetch(`${BACKEND_URL}/admin/services`, { headers: h, cache: "no-store" }),
  ]);
  const [catalog, contracts] = await Promise.all([
    catalogRes.json(),
    contractsRes.json(),
  ]);
  return {
    catalog: catalog.data ?? [],
    contracts: contracts.data ?? [],
  };
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 10)}…${address.slice(-6)}`;
}

export default async function ServicesPage() {
  const { catalog, contracts } = await getData();

  const byService = new Map<string, ServiceContract[]>();
  for (const c of contracts) {
    if (!byService.has(c.serviceId)) byService.set(c.serviceId, []);
    byService.get(c.serviceId)!.push(c);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Services</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deployed smart contracts per service. Add a record when you deploy a new contract.
        </p>
      </div>

      <div className="space-y-4">
        {catalog.map((service) => {
          const serviceContracts = byService.get(service.id) ?? [];
          return (
            <div key={service.id} className="glass rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold">{service.displayName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{service.id}</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground border border-border rounded px-2 py-0.5">
                  {service.standard}
                </span>
              </div>

              {serviceContracts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                        <th className="text-left pb-2 pr-4">Chain</th>
                        <th className="text-left pb-2 pr-4">Address</th>
                        <th className="text-left pb-2 pr-4">Start Block</th>
                        <th className="text-left pb-2 pr-4">Deployed</th>
                        <th className="text-left pb-2 pr-4">Status</th>
                        <th className="text-left pb-2 pr-4">Notes</th>
                        <th className="text-left pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {serviceContracts.map((contract) => (
                        <tr key={contract.id} className={contract.active ? "" : "opacity-50"}>
                          <td className="py-2 pr-4 text-muted-foreground">{contract.chain}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{truncateAddress(contract.contractAddress)}</td>
                          <td className="py-2 pr-4 font-mono text-xs">{contract.startBlock}</td>
                          <td className="py-2 pr-4 text-muted-foreground text-xs">
                            {new Date(contract.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 pr-4">
                            <span className={`text-xs font-medium ${contract.active ? "text-green-400" : "text-muted-foreground"}`}>
                              {contract.active ? "● Active" : "○ Inactive"}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-xs text-muted-foreground">{contract.notes ?? "—"}</td>
                          <td className="py-2 text-xs">
                            <ContractActions contractId={contract.id} active={contract.active} notes={contract.notes} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No contracts registered.</p>
              )}

              <AddContractForm serviceId={service.id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
