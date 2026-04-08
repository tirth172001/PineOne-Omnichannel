"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  CreditCard,
  Smartphone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  FileText,
  Banknote,
  Truck,
  Clock,
  HelpCircle,
  Upload,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Business Details", icon: Building2 },
  { id: 2, title: "Bank Account", icon: Banknote },
  { id: 3, title: "Choose Device", icon: Smartphone },
  { id: 4, title: "Delivery", icon: MapPin },
  { id: 5, title: "Review", icon: FileText },
]

const deviceOptions = [
  {
    id: "p1000",
    name: "Pine Labs P1000",
    description: "Android-based smart POS with 5.5\" touchscreen",
    features: ["Tap, Insert, Swipe", "Built-in printer", "4G + WiFi", "All-day battery"],
    price: "Free rental",
    deposit: "₹2,000",
    image: "/pos-p1000.png",
    popular: true,
  },
  {
    id: "p2000",
    name: "Pine Labs P2000",
    description: "Premium POS with dual screen for customer display",
    features: ["Dual touchscreen", "Fast printing", "4G + WiFi + Ethernet", "Premium support"],
    price: "₹500/month",
    deposit: "₹5,000",
    image: "/pos-p2000.png",
    popular: false,
  },
  {
    id: "m200",
    name: "Pine Labs M200",
    description: "Compact mobile POS for on-the-go transactions",
    features: ["Pocket-sized", "Bluetooth enabled", "Long battery", "Lightweight"],
    price: "Free rental",
    deposit: "₹1,500",
    image: "/pos-m200.png",
    popular: false,
  },
]

export function POSOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Business details
    businessName: "Sharma Electronics",
    businessType: "retail",
    gstin: "29ABCDE1234F1Z5",
    pan: "ABCDE1234F",
    monthlyVolume: "1-5lakh",
    // Bank account
    accountHolder: "Rahul Sharma",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    // Device
    selectedDevice: "",
    quantity: "1",
    // Delivery
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    contactPerson: "Rahul Sharma",
    contactPhone: "9876543210",
    preferredDate: "",
    // Terms
    acceptTerms: false,
  })

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed"
    if (stepId === currentStep) return "current"
    return "upcoming"
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Smartphone className="h-4 w-4" />
          <span>POS Device Setup</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Get started with your POS machine</h1>
        <p className="text-muted-foreground mt-1">
          Complete the following steps to activate your Pine Labs POS terminal
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      status === "completed" && "bg-primary border-primary",
                      status === "current" && "border-primary bg-primary/10",
                      status === "upcoming" && "border-border bg-secondary"
                    )}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          status === "current" ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      status === "current" ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-16 mx-2 mt-[-20px]",
                      index < currentStep - 1 ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          {/* Step 1: Business Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Verify your business details</h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve pre-filled your information. Please verify and update if needed.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => updateFormData("businessName", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => updateFormData("businessType", value)}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="restaurant">Restaurant / Food</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <div className="relative">
                    <Input
                      id="gstin"
                      value={formData.gstin}
                      onChange={(e) => updateFormData("gstin", e.target.value)}
                      className="bg-secondary border-border pr-10"
                    />
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                  </div>
                  <p className="text-xs text-success">Verified with GST portal</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <div className="relative">
                    <Input
                      id="pan"
                      value={formData.pan}
                      onChange={(e) => updateFormData("pan", e.target.value)}
                      className="bg-secondary border-border pr-10"
                    />
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                  </div>
                  <p className="text-xs text-success">Verified</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Expected Monthly Transaction Volume</Label>
                  <RadioGroup
                    value={formData.monthlyVolume}
                    onValueChange={(value) => updateFormData("monthlyVolume", value)}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {[
                      { value: "0-1lakh", label: "Under ₹1 Lakh" },
                      { value: "1-5lakh", label: "₹1-5 Lakh" },
                      { value: "5-10lakh", label: "₹5-10 Lakh" },
                      { value: "10+lakh", label: "₹10+ Lakh" },
                    ].map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={option.value}
                          className={cn(
                            "flex items-center justify-center rounded-lg border-2 border-border bg-secondary p-3 text-sm cursor-pointer transition-colors hover:bg-secondary/80",
                            formData.monthlyVolume === option.value &&
                              "border-primary bg-primary/10"
                          )}
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Your information is encrypted and securely stored as per RBI guidelines.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Bank Account */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Add settlement bank account</h2>
                <p className="text-sm text-muted-foreground">
                  All your transaction settlements will be credited to this account within T+1 day.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    value={formData.accountHolder}
                    onChange={(e) => updateFormData("accountHolder", e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Name as per bank records"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => updateFormData("accountNumber", e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Enter account number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                  <Input
                    id="confirmAccountNumber"
                    value={formData.confirmAccountNumber}
                    onChange={(e) => updateFormData("confirmAccountNumber", e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Re-enter account number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode}
                    onChange={(e) => updateFormData("ifscCode", e.target.value.toUpperCase())}
                    className="bg-secondary border-border"
                    placeholder="e.g., HDFC0001234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => updateFormData("bankName", e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Auto-detected from IFSC"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Or upload cancelled cheque / bank statement</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                <Clock className="h-4 w-4 text-chart-3 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Quick settlement enabled</p>
                  <p className="text-xs text-muted-foreground">
                    Based on your transaction volume, you qualify for next-day settlements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Choose Device */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Select your POS device</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a device that best fits your business needs. All devices support all major payment methods.
                </p>
              </div>

              <div className="grid gap-4">
                {deviceOptions.map((device) => (
                  <div
                    key={device.id}
                    onClick={() => updateFormData("selectedDevice", device.id)}
                    className={cn(
                      "relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-primary/50",
                      formData.selectedDevice === device.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-secondary/30"
                    )}
                  >
                    {device.popular && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    )}
                    <div className="flex gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-secondary">
                        <Smartphone className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{device.name}</h3>
                            <p className="text-sm text-muted-foreground">{device.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {device.features.map((feature) => (
                            <Badge
                              key={feature}
                              variant="secondary"
                              className="bg-secondary text-muted-foreground"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-foreground font-medium">{device.price}</span>
                          <span className="text-muted-foreground">
                            Refundable deposit: {device.deposit}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                            formData.selectedDevice === device.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          )}
                        >
                          {formData.selectedDevice === device.id && (
                            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="quantity" className="shrink-0">Number of devices</Label>
                <Select
                  value={formData.quantity}
                  onValueChange={(value) => updateFormData("quantity", value)}
                >
                  <SelectTrigger className="w-24 bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Delivery */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Delivery address</h2>
                <p className="text-sm text-muted-foreground">
                  Where should we deliver your POS device? Free delivery within 3-5 business days.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => updateFormData("addressLine1", e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Shop/Building name, Street address"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) => updateFormData("addressLine2", e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Landmark, Area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateFormData("state", value)}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="telangana">Telangana</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => updateFormData("pincode", e.target.value)}
                    className="bg-secondary border-border"
                    placeholder="6-digit pincode"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Delivery Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => updateFormData("preferredDate", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => updateFormData("contactPerson", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => updateFormData("contactPhone", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary border border-border">
                <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Free installation included</p>
                  <p className="text-xs text-muted-foreground">
                    Our technician will visit to set up your device and provide training.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Review and confirm</h2>
                <p className="text-sm text-muted-foreground">
                  Please review your details before submitting your application.
                </p>
              </div>

              <div className="space-y-4">
                {/* Business Summary */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-foreground">Business Details</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="text-primary h-auto p-0"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Business Name</p>
                      <p className="text-foreground">{formData.businessName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">GSTIN</p>
                      <p className="text-foreground">{formData.gstin}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">PAN</p>
                      <p className="text-foreground">{formData.pan}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expected Volume</p>
                      <p className="text-foreground">{formData.monthlyVolume}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Summary */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-foreground">Bank Account</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      className="text-primary h-auto p-0"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Account Holder</p>
                      <p className="text-foreground">{formData.accountHolder}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Number</p>
                      <p className="text-foreground">
                        {formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">IFSC Code</p>
                      <p className="text-foreground">{formData.ifscCode || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bank Name</p>
                      <p className="text-foreground">{formData.bankName || "Auto-detected"}</p>
                    </div>
                  </div>
                </div>

                {/* Device Summary */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-foreground">Device Selection</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(3)}
                      className="text-primary h-auto p-0"
                    >
                      Edit
                    </Button>
                  </div>
                  {formData.selectedDevice && (
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {deviceOptions.find((d) => d.id === formData.selectedDevice)?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {formData.quantity} • Deposit:{" "}
                          {deviceOptions.find((d) => d.id === formData.selectedDevice)?.deposit}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Summary */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h3 className="font-medium text-foreground">Delivery Address</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(4)}
                      className="text-primary h-auto p-0"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="text-sm">
                    <p className="text-foreground">
                      {formData.addressLine1 || "Address not provided"}
                      {formData.addressLine2 && `, ${formData.addressLine2}`}
                    </p>
                    <p className="text-muted-foreground">
                      {formData.city && `${formData.city}, `}
                      {formData.state && `${formData.state} `}
                      {formData.pincode}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Contact: {formData.contactPerson} ({formData.contactPhone})
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => updateFormData("acceptTerms", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    By proceeding, you authorize Pine Labs to verify your business and bank details.
                  </p>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <h4 className="font-medium text-foreground mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device rental</span>
                    <span className="text-foreground">
                      {deviceOptions.find((d) => d.id === formData.selectedDevice)?.price || "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Refundable deposit</span>
                    <span className="text-foreground">
                      {deviceOptions.find((d) => d.id === formData.selectedDevice)?.deposit || "₹0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installation</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Total due today</span>
                      <span className="text-foreground">
                        {deviceOptions.find((d) => d.id === formData.selectedDevice)?.deposit || "₹0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2 bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          Need help? <button className="text-primary hover:underline">Contact support</button>
        </div>

        {currentStep < steps.length ? (
          <Button onClick={nextStep} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => alert("Application submitted!")}
            disabled={!formData.acceptTerms}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Submit Application
          </Button>
        )}
      </div>
    </div>
  )
}
