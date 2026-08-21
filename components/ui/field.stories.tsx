import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./field"
import { Input } from "./input"

const meta = {
  title: "UI/Field",
  component: FieldSet,
  tags: ["autodocs"],
} satisfies Meta<typeof FieldSet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <FieldSet className="w-80">
      <FieldLegend>Business details</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="business-name">Business name</FieldLabel>
          <FieldContent>
            <Input id="business-name" placeholder="Acme Payments Pvt Ltd" />
            <FieldDescription>Shown on customer-facing receipts.</FieldDescription>
          </FieldContent>
        </Field>
        <Field data-invalid="true">
          <FieldLabel htmlFor="gstin">GSTIN</FieldLabel>
          <FieldContent>
            <Input id="gstin" aria-invalid defaultValue="INVALID123" />
            <FieldError>GSTIN format looks incorrect.</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
}
