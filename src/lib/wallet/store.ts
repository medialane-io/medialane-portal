import { ownerStore } from "./client";

export const loadSealedOwner = () => ownerStore.load();
export const loadWalletAddress = () => ownerStore.loadAddress();
export const saveSealedOwner = (sealed: Parameters<typeof ownerStore.save>[0]) => ownerStore.save(sealed);
export const clearSealedOwner = () => ownerStore.clear();
export const notifyWalletChange = () => ownerStore.notifyChange();
export const onWalletChange = (listener: () => void) => ownerStore.onChange(listener);
