"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Landmark,
  Shield,
  Clock,
  TrendingUp,
  Calculator,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  IndianRupee,
  Calendar,
  Percent,
  Building2,
  CreditCard,
  Upload,
  Eye,
  Download,
  Zap,
} from "lucide-react"

const steps = [
  { id: 1, name: "Check Eligibility", icon: Calculator },
  { id: 2, name: "Choose Offer", icon: IndianRupee },
  { id: 3, name: "Verify Identity", icon: Shield },
  { id: 4, name: "E-Agreement", icon: FileText },
  { id: 5, name: "Disbursement", icon: CheckCircle2 },
]

export function LendingApplicationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [eligibilityChecked, setEligibilityChecked] = useState(false)
  const [formData, setFormData] = useState({
    // Eligibility
    loanPurpose: "working-capital",
    monthlyRevenue: "3-5-lakhs",
    
    // Loan offer selection
    selectedOffer: "standard",
    loanAmount: [300000],
    tenure: 12,
    
    // KYC
    aadhaarNumber: "",
    aadhaarOtp: "",
    panNumber: "ABCDE1234F",
    panVerified: true,
    selfieUploaded: false,
    
    // Agreement
    agreementAccepted: false,
    autoDebitAccepted: false,
    
    // Disbursement
    disbursementAccount: "existing",
    accountNumber: "XXXX XXXX 4532",
    bankName: "HDFC Bank",
  })

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const checkEligibility = () => {
    // Simulate eligibility check
    setTimeout(() => {
      setEligibilityChecked(true)
    }, 1500)
  }

  const progress = (currentStep / steps.length) * 100

  // Loan calculation based on selected amount and tenure
  const loanAmount = formData.loanAmount[0]
  const interestRate = 18 // 18% per annum
  const tenure = formData.tenure
  const monthlyInterestRate = interestRate / 12 / 100
  const emi = Math.round(
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure)) /
    (Math.pow(1 + monthlyInterestRate, tenure) - 1)
  )
  const totalAmount = emi * tenure
  const totalInterest = totalAmount - loanAmount

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Landmark className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">Merchant Lending</h1>
                  <p className="text-xs text-muted-foreground">Quick business credit</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>256-bit encrypted</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                            ? "bg-primary/20 text-primary border-2 border-primary"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-1.5 ${isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 mt-[-20px] ${currentStep > step.id ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              )
            })}
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Check Eligibility */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {!eligibilityChecked ? (
              <>
                <div className="text-center max-w-lg mx-auto">
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Check Your Credit Eligibility</h2>
                  <p className="text-muted-foreground">
                    Based on your transaction history with Pine Labs, you may be pre-approved for instant credit.
                  </p>
                </div>

                {/* Pre-approval indicator */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground mb-1">Good news! You may be pre-approved</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Your business has processed over 500 transactions in the last 3 months with a healthy success rate.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-foreground">6+ months active</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-foreground">Good transaction volume</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tell us about your needs</CardTitle>
                    <CardDescription>This helps us customize your offer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>What do you need the funds for?</Label>
                      <RadioGroup
                        value={formData.loanPurpose}
                        onValueChange={(value) => setFormData({ ...formData, loanPurpose: value })}
                        className="grid grid-cols-2 gap-3"
                      >
                        {[
                          { value: "working-capital", label: "Working Capital", desc: "Day-to-day operations" },
                          { value: "inventory", label: "Inventory Purchase", desc: "Stock up for season" },
                          { value: "equipment", label: "Equipment", desc: "Buy or repair equipment" },
                          { value: "expansion", label: "Business Expansion", desc: "New location or services" },
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                            <Label
                              htmlFor={option.value}
                              className="flex flex-col p-4 rounded-lg border border-border bg-card cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                            >
                              <span className="font-medium text-foreground">{option.label}</span>
                              <span className="text-xs text-muted-foreground">{option.desc}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>What is your approximate monthly revenue?</Label>
                      <RadioGroup
                        value={formData.monthlyRevenue}
                        onValueChange={(value) => setFormData({ ...formData, monthlyRevenue: value })}
                        className="grid grid-cols-2 gap-3"
                      >
                        {[
                          { value: "1-3-lakhs", label: "1-3 Lakhs" },
                          { value: "3-5-lakhs", label: "3-5 Lakhs" },
                          { value: "5-10-lakhs", label: "5-10 Lakhs" },
                          { value: "10-plus-lakhs", label: "10+ Lakhs" },
                        ].map((option) => (
                          <div key={option.value} className="relative">
                            <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                            <Label
                              htmlFor={option.value}
                              className="flex items-center justify-center p-3 rounded-lg border border-border bg-card cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                            >
                              <span className="font-medium text-foreground">{option.label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button size="lg" onClick={checkEligibility}>
                    Check Eligibility
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Eligibility result */}
                <div className="text-center max-w-lg mx-auto">
                  <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">You are Pre-Approved!</h2>
                  <p className="text-muted-foreground">
                    Congratulations! Based on your transaction history, you are eligible for instant credit.
                  </p>
                </div>

                <Card className="border-primary/30">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Pre-approved credit limit</p>
                      <div className="flex items-center justify-center gap-1 mb-4">
                        <span className="text-4xl font-bold text-foreground">Up to</span>
                        <span className="text-4xl font-bold text-primary">5,00,000</span>
                      </div>
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Disbursement in 2 hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Starting 18% p.a.</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Zap, label: "No Collateral", desc: "Unsecured loan" },
                    { icon: Calendar, label: "Flexible Tenure", desc: "3 to 24 months" },
                    { icon: CreditCard, label: "Auto Debit EMI", desc: "From settlements" },
                  ].map((feature) => (
                    <Card key={feature.label}>
                      <CardContent className="p-4 text-center">
                        <feature.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="font-medium text-foreground text-sm">{feature.label}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button size="lg" onClick={handleNext}>
                    View Loan Offers
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Choose Offer */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Customize Your Loan</h2>
              <p className="text-muted-foreground">Adjust the amount and tenure to fit your needs</p>
            </div>

            {/* Loan amount slider */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Loan Amount</Label>
                    <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                      <IndianRupee className="h-5 w-5" />
                      {loanAmount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Slider
                    value={formData.loanAmount}
                    onValueChange={(value) => setFormData({ ...formData, loanAmount: value })}
                    min={50000}
                    max={500000}
                    step={10000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50,000</span>
                    <span>5,00,000</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Repayment Tenure</Label>
                  <RadioGroup
                    value={formData.tenure.toString()}
                    onValueChange={(value) => setFormData({ ...formData, tenure: parseInt(value) })}
                    className="grid grid-cols-4 gap-3"
                  >
                    {[6, 12, 18, 24].map((months) => (
                      <div key={months} className="relative">
                        <RadioGroupItem value={months.toString()} id={`tenure-${months}`} className="peer sr-only" />
                        <Label
                          htmlFor={`tenure-${months}`}
                          className="flex flex-col items-center p-3 rounded-lg border border-border bg-card cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <span className="font-semibold text-foreground">{months}</span>
                          <span className="text-xs text-muted-foreground">months</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* EMI Calculator */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
                    <div className="flex items-center justify-center gap-1">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{emi.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="text-center border-x border-border">
                    <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                    <div className="flex items-center justify-center gap-1">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold text-foreground">{totalInterest.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Payable</p>
                    <div className="flex items-center justify-center gap-1">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-2xl font-bold text-foreground">{totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offer options */}
            <div className="space-y-3">
              <Label className="text-base">Select an Offer</Label>
              <RadioGroup
                value={formData.selectedOffer}
                onValueChange={(value) => setFormData({ ...formData, selectedOffer: value })}
                className="space-y-3"
              >
                {[
                  { 
                    value: "standard", 
                    label: "Standard", 
                    rate: "18%", 
                    processing: "2%",
                    desc: "Standard terms with competitive rates",
                    badge: null
                  },
                  { 
                    value: "low-rate", 
                    label: "Low Rate", 
                    rate: "16%", 
                    processing: "2.5%",
                    desc: "Lower interest rate with slightly higher processing fee",
                    badge: "Best Rate"
                  },
                  { 
                    value: "zero-processing", 
                    label: "Zero Processing", 
                    rate: "19%", 
                    processing: "0%",
                    desc: "No processing fee, get the full amount",
                    badge: "Popular"
                  },
                ].map((offer) => (
                  <div key={offer.value} className="relative">
                    <RadioGroupItem value={offer.value} id={offer.value} className="peer sr-only" />
                    <Label
                      htmlFor={offer.value}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full border-2 ${formData.selectedOffer === offer.value ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                          {formData.selectedOffer === offer.value && (
                            <div className="h-full w-full flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{offer.label}</span>
                            {offer.badge && (
                              <Badge variant="secondary" className="text-xs">{offer.badge}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{offer.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{offer.rate} p.a.</p>
                        <p className="text-xs text-muted-foreground">Processing: {offer.processing}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" size="lg" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button size="lg" onClick={handleNext}>
                Continue to Verification
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verify Identity */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Verify Your Identity</h2>
              <p className="text-muted-foreground">Complete KYC verification to proceed with your loan</p>
            </div>

            {/* PAN Verification - Already done */}
            <Card className="border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">PAN Verification</p>
                      <p className="text-sm text-muted-foreground">{formData.panNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aadhaar Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Aadhaar Verification
                </CardTitle>
                <CardDescription>
                  We will send an OTP to your Aadhaar-linked mobile number
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    placeholder="XXXX XXXX XXXX"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    maxLength={14}
                  />
                </div>
                {formData.aadhaarNumber.length >= 12 && (
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar-otp">Enter OTP</Label>
                    <div className="flex gap-3">
                      <Input
                        id="aadhaar-otp"
                        placeholder="6-digit OTP"
                        value={formData.aadhaarOtp}
                        onChange={(e) => setFormData({ ...formData, aadhaarOtp: e.target.value })}
                        maxLength={6}
                        className="flex-1"
                      />
                      <Button variant="outline">Resend OTP</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">OTP sent to mobile ending with ****7890</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selfie Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Selfie Verification
                </CardTitle>
                <CardDescription>
                  Take a quick selfie to verify your identity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!formData.selfieUploaded ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Click below to take a selfie or upload a photo
                    </p>
                    <Button variant="outline" onClick={() => setFormData({ ...formData, selfieUploaded: true })}>
                      Take Selfie
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Selfie uploaded</p>
                        <p className="text-sm text-muted-foreground">Verification in progress...</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Business Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-medium text-foreground">Sharma Electronics</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">GSTIN</p>
                    <p className="font-medium text-foreground">27AABCU9603R1ZM</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Business Type</p>
                    <p className="font-medium text-foreground">Retail - Electronics</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Active Since</p>
                    <p className="font-medium text-foreground">March 2022</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" size="lg" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                size="lg" 
                onClick={handleNext}
                disabled={!formData.aadhaarOtp || !formData.selfieUploaded}
              >
                Continue to Agreement
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: E-Agreement */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Review & Sign Agreement</h2>
              <p className="text-muted-foreground">Please review the loan terms and sign digitally</p>
            </div>

            {/* Loan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="text-lg font-semibold text-foreground">Rs. {loanAmount.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Interest Rate</p>
                    <p className="text-lg font-semibold text-foreground">{interestRate}% p.a.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tenure</p>
                    <p className="text-lg font-semibold text-foreground">{tenure} months</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Monthly EMI</p>
                    <p className="text-lg font-semibold text-primary">Rs. {emi.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Processing Fee (2%)</span>
                    <span className="text-foreground">Rs. {(loanAmount * 0.02).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">GST on Processing Fee</span>
                    <span className="text-foreground">Rs. {(loanAmount * 0.02 * 0.18).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-border">
                    <span className="text-foreground">Net Disbursement Amount</span>
                    <span className="text-primary">Rs. {(loanAmount - (loanAmount * 0.02) - (loanAmount * 0.02 * 0.18)).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Document */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Loan Agreement</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/50 rounded-lg p-4 h-48 overflow-y-auto text-sm text-muted-foreground space-y-3">
                  <p className="font-medium text-foreground">LOAN AGREEMENT</p>
                  <p>This Loan Agreement is entered into between Pine Labs Private Limited (Lender) and Sharma Electronics represented by Rahul Sharma (Borrower).</p>
                  <p><strong>1. Loan Details:</strong> The Lender agrees to provide a loan of Rs. {loanAmount.toLocaleString("en-IN")} at an interest rate of {interestRate}% per annum for a tenure of {tenure} months.</p>
                  <p><strong>2. Repayment:</strong> The Borrower agrees to repay the loan through monthly EMIs of Rs. {emi.toLocaleString("en-IN")} via auto-debit from daily settlements.</p>
                  <p><strong>3. Prepayment:</strong> The Borrower may prepay the loan at any time without any prepayment penalty after 3 EMIs.</p>
                  <p><strong>4. Default:</strong> In case of default, a late payment fee of 2% per month will be applicable on the overdue amount.</p>
                  <p>...</p>
                </div>
              </CardContent>
            </Card>

            {/* Consents */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreement"
                    checked={formData.agreementAccepted}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreementAccepted: checked as boolean })}
                  />
                  <Label htmlFor="agreement" className="text-sm leading-relaxed cursor-pointer">
                    I have read and agree to the Loan Agreement, Terms & Conditions, and Privacy Policy. I authorize Pine Labs to process my loan application.
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="auto-debit"
                    checked={formData.autoDebitAccepted}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoDebitAccepted: checked as boolean })}
                  />
                  <Label htmlFor="auto-debit" className="text-sm leading-relaxed cursor-pointer">
                    I authorize Pine Labs to auto-debit EMI amounts from my daily settlements. In case of insufficient settlement, I authorize debit from my registered bank account.
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" size="lg" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                size="lg" 
                onClick={handleNext}
                disabled={!formData.agreementAccepted || !formData.autoDebitAccepted}
              >
                Sign & Submit
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Disbursement */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="h-20 w-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Loan Approved!</h2>
              <p className="text-muted-foreground">
                Your loan has been approved and is being processed for disbursement.
              </p>
            </div>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Disbursement Amount</p>
                    <p className="text-3xl font-bold text-foreground">Rs. {(loanAmount - (loanAmount * 0.02) - (loanAmount * 0.02 * 0.18)).toLocaleString("en-IN")}</p>
                  </div>
                  <Badge className="bg-warning/20 text-warning-foreground border-warning/30">Processing</Badge>
                </div>
                
                {/* Disbursement progress */}
                <div className="space-y-3">
                  {[
                    { label: "Application Submitted", status: "completed", time: "Just now" },
                    { label: "Documents Verified", status: "completed", time: "Just now" },
                    { label: "Loan Approved", status: "completed", time: "Just now" },
                    { label: "Disbursement Initiated", status: "current", time: "In progress" },
                    { label: "Amount Credited", status: "pending", time: "Est. 2 hours" },
                  ].map((step, index) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        step.status === "completed" 
                          ? "bg-primary text-primary-foreground" 
                          : step.status === "current"
                            ? "bg-warning text-warning-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}>
                        {step.status === "completed" ? (
                          <Check className="h-3 w-3" />
                        ) : step.status === "current" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{step.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Disbursement Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                  <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{formData.bankName}</p>
                    <p className="text-sm text-muted-foreground">Account: {formData.accountNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EMI Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">EMI Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">First EMI Date</span>
                    <span className="font-medium text-foreground">5th March, 2026</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">EMI Amount</span>
                    <span className="font-medium text-foreground">Rs. {emi.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Last EMI Date</span>
                    <span className="font-medium text-foreground">5th {tenure === 12 ? "February" : tenure === 6 ? "August" : tenure === 18 ? "August" : "February"}, {tenure > 12 ? "2027" : "2027"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Deduction Mode</span>
                    <span className="font-medium text-foreground">Auto-debit from settlements</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 p-4 bg-secondary/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You will receive an SMS and email once the amount is credited to your account.
              </p>
            </div>

            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link href="/">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
