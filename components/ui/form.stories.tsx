import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "./button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form"
import { Input } from "./input"

const formSchema = z.object({
  email: z.string().email("Enter a valid email address."),
})

function FormExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="w-80 space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@company.com" {...field} />
              </FormControl>
              <FormDescription>We'll send settlement alerts here.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

const meta = {
  title: "UI/Form",
  component: FormExample,
  tags: ["autodocs"],
} satisfies Meta<typeof FormExample>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
