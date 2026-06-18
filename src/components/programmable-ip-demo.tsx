"use client"

import { useState } from "react"
import { Slider } from "@/src/components/ui/slider"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Copy, Check, DollarSign, Users, Zap } from "lucide-react"
import { useToast } from "@/src/components/ui/use-toast"
import { useMobile } from "@/src/hooks/use-mobile"

export default function ProgrammableIPDemo() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({
    commercialUse: true,
    derivativeWorks: true,
    attribution: true,
    royaltyPercentage: 5,
    licenseDuration: 12, // months
    territoryRestriction: false,
    autoRenewal: true,
  })

  const handleCopy = () => {
    setCopied(true)
    toast({
      title: "Code copied to clipboard",
      description: "You can now paste the code in your project",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSettingChange = (key: string, value: number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Calculate estimated revenue based on settings
  const calculateEstimatedRevenue = () => {
    let baseAmount = 1000

    // Adjust based on settings
    if (settings.commercialUse) baseAmount *= 1.5
    if (settings.derivativeWorks) baseAmount *= 1.2
    if (!settings.attribution) baseAmount *= 0.8

    // Adjust for royalty percentage
    baseAmount *= 1 + settings.royaltyPercentage / 100

    // Adjust for license duration
    baseAmount *= settings.licenseDuration / 12

    // Format as currency
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(baseAmount)
  }

  return (
    <div className="glass-effect border border-white/10 rounded-xl overflow-hidden">
      <Tabs defaultValue="visual" className="w-full">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-bold text-lg">Programmable IP Demo</h3>
          <TabsList className="bg-background/20">
            <TabsTrigger value="visual" className="text-xs">
              Visual Builder
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              Code View
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visual" className="p-0 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-6 border-r border-white/10">
              <h4 className="font-medium mb-6">Define Your IP Rules</h4>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="commercial-use" className="font-medium">
                      Commercial Use
                    </Label>
                    <p className="text-xs text-zinc-400">Allow others to use your IP commercially</p>
                  </div>
                  <Switch
                    id="commercial-use"
                    checked={settings.commercialUse}
                    onCheckedChange={(checked) => handleSettingChange("commercialUse", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="derivative-works" className="font-medium">
                      Derivative Works
                    </Label>
                    <p className="text-xs text-zinc-400">Allow others to create derivatives</p>
                  </div>
                  <Switch
                    id="derivative-works"
                    checked={settings.derivativeWorks}
                    onCheckedChange={(checked) => handleSettingChange("derivativeWorks", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="attribution" className="font-medium">
                      Attribution Required
                    </Label>
                    <p className="text-xs text-zinc-400">Users must credit you as the creator</p>
                  </div>
                  <Switch
                    id="attribution"
                    checked={settings.attribution}
                    onCheckedChange={(checked) => handleSettingChange("attribution", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="royalty-percentage" className="font-medium">
                      Royalty Percentage
                    </Label>
                    <span className="text-sm font-medium">{settings.royaltyPercentage}%</span>
                  </div>
                  <Slider
                    id="royalty-percentage"
                    min={0}
                    max={20}
                    step={0.5}
                    value={[settings.royaltyPercentage]}
                    onValueChange={(value) => handleSettingChange("royaltyPercentage", value[0])}
                  />
                  <p className="text-xs text-zinc-400">Percentage of revenue you receive from commercial use</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="license-duration" className="font-medium">
                      License Duration
                    </Label>
                    <span className="text-sm font-medium">{settings.licenseDuration} months</span>
                  </div>
                  <Slider
                    id="license-duration"
                    min={1}
                    max={36}
                    step={1}
                    value={[settings.licenseDuration]}
                    onValueChange={(value) => handleSettingChange("licenseDuration", value[0])}
                  />
                  <p className="text-xs text-zinc-400">How long the license remains valid</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="territory-restriction" className="font-medium">
                      Territory Restriction
                    </Label>
                    <p className="text-xs text-zinc-400">Limit usage to specific regions</p>
                  </div>
                  <Switch
                    id="territory-restriction"
                    checked={settings.territoryRestriction}
                    onCheckedChange={(checked) => handleSettingChange("territoryRestriction", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-renewal" className="font-medium">
                      Auto Renewal
                    </Label>
                    <p className="text-xs text-zinc-400">Automatically renew licenses upon expiration</p>
                  </div>
                  <Switch
                    id="auto-renewal"
                    checked={settings.autoRenewal}
                    onCheckedChange={(checked) => handleSettingChange("autoRenewal", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/30">
              <h4 className="font-medium mb-6">Revenue Projection</h4>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="rounded-full bg-primary/20 p-3 mr-3">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">{calculateEstimatedRevenue()}</h3>
                        <p className="text-xs text-zinc-400">Estimated annual revenue</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full">
                      Details
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-zinc-400" />
                        <span className="text-sm">Potential Licensees</span>
                      </div>
                      <span className="font-medium">120+</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-zinc-400" />
                        <span className="text-sm">Automated Transactions</span>
                      </div>
                      <span className="font-medium">100%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-zinc-400" />
                        <span className="text-sm">Revenue Streams</span>
                      </div>
                      <span className="font-medium">Multiple</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Button className="w-full">Deploy Programmable IP</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="p-0 m-0">
          <div className="relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>

            <pre className="p-6 overflow-auto bg-black/30 text-sm font-mono text-zinc-300 max-h-[500px]">
              <code>{`// MediaLane Programmable IP Smart Contract
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MediaLaneProgrammableIP is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct License {
        bool commercialUse;
        bool derivativeWorks;
        bool attribution;
        uint256 royaltyPercentage;
        uint256 licenseDuration;
        bool territoryRestriction;
        bool autoRenewal;
        uint256 startDate;
        uint256 endDate;
        address licensee;
        bool active;
    }
    
    mapping(uint256 => License) public licenses;
    mapping(uint256 => string) public territories;
    
    event LicenseCreated(uint256 tokenId, address licensee);
    event LicenseRenewed(uint256 tokenId, address licensee);
    event RoyaltyPaid(uint256 tokenId, address licensee, uint256 amount);
    
    constructor() ERC721("MediaLane Programmable IP", "MLIP") {}
    
    function createProgrammableIP(
        address creator,
        string memory tokenURI,
        bool _commercialUse,
        bool _derivativeWorks,
        bool _attribution,
        uint256 _royaltyPercentage,
        uint256 _licenseDuration,
        bool _territoryRestriction,
        bool _autoRenewal
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(creator, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        licenses[newItemId] = License({
            commercialUse: _commercialUse,
            derivativeWorks: _derivativeWorks,
            attribution: _attribution,
            royaltyPercentage: _royaltyPercentage,
            licenseDuration: _licenseDuration,
            territoryRestriction: _territoryRestriction,
            autoRenewal: _autoRenewal,
            startDate: block.timestamp,
            endDate: block.timestamp + (_licenseDuration * 30 days),
            licensee: address(0),
            active: false
        });
        
        return newItemId;
    }
    
    function acquireLicense(uint256 tokenId) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(licenses[tokenId].licensee == address(0) || !licenses[tokenId].active, "License already active");
        
        // Transfer payment to token owner
        address payable owner = payable(ownerOf(tokenId));
        owner.transfer(msg.value);
        
        // Activate license
        licenses[tokenId].licensee = msg.sender;
        licenses[tokenId].active = true;
        licenses[tokenId].startDate = block.timestamp;
        licenses[tokenId].endDate = block.timestamp + (licenses[tokenId].licenseDuration * 30 days);
        
        emit LicenseCreated(tokenId, msg.sender);
    }
    
    function renewLicense(uint256 tokenId) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(licenses[tokenId].licensee == msg.sender, "Not the licensee");
        require(licenses[tokenId].autoRenewal, "Auto renewal not enabled");
        
        // Transfer payment to token owner
        address payable owner = payable(ownerOf(tokenId));
        owner.transfer(msg.value);
        
        // Renew license
        licenses[tokenId].startDate = block.timestamp;
        licenses[tokenId].endDate = block.timestamp + (licenses[tokenId].licenseDuration * 30 days);
        
        emit LicenseRenewed(tokenId, msg.sender);
    }
    
    function payRoyalty(uint256 tokenId) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(licenses[tokenId].licensee == msg.sender, "Not the licensee");
        
        // Transfer royalty to token owner
        address payable owner = payable(ownerOf(tokenId));
        owner.transfer(msg.value);
        
        emit RoyaltyPaid(tokenId, msg.sender, msg.value);
    }
    
    function isLicenseActive(uint256 tokenId) public view returns (bool) {
        return licenses[tokenId].active && block.timestamp <= licenses[tokenId].endDate;
    }
}`}</code>
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="p-0 m-0">
          <div className="p-6 bg-black/30">
            <div className="glass-effect border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-primary mr-3" />
                <div>
                  <h3 className="font-bold">Digital Art Collection License</h3>
                  <p className="text-xs text-zinc-400">Powered by MediaLane Programmable IP</p>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm">Commercial Use</span>
                  <span className="text-sm font-medium">{settings.commercialUse ? "Allowed" : "Not Allowed"}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm">Derivative Works</span>
                  <span className="text-sm font-medium">{settings.derivativeWorks ? "Allowed" : "Not Allowed"}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm">Attribution Required</span>
                  <span className="text-sm font-medium">{settings.attribution ? "Yes" : "No"}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm">Royalty Percentage</span>
                  <span className="text-sm font-medium">{settings.royaltyPercentage}%</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm">License Duration</span>
                  <span className="text-sm font-medium">{settings.licenseDuration} months</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm">Territory Restriction</span>
                  <span className="text-sm font-medium">{settings.territoryRestriction ? "Yes" : "No"}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm">Auto Renewal</span>
                  <span className="text-sm font-medium">{settings.autoRenewal ? "Enabled" : "Disabled"}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full">Acquire License</Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-2">This license is automatically enforced by smart contracts</p>
              <p className="text-xs text-zinc-500">No lawyers or intermediaries required</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
