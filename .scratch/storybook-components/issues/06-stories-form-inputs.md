Type: task
Status: resolved

## Question

Write stories for the form/input-primitive components in `components/ui/`, following [Story authoring conventions](02-story-authoring-conventions.md) and the pattern proven in [Install and scaffold Storybook](04-install-and-scaffold-storybook.md)'s `button.stories.tsx`:

`input.tsx`, `textarea.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `slider.tsx`, `select.tsx`, `input-otp.tsx`, `input-group.tsx`, `label.tsx`, `field.tsx`, `form.tsx`, `toggle.tsx`, `toggle-group.tsx`, `button-group.tsx`, `kbd.tsx`.

For each: one co-located `*.stories.tsx`, `title: "UI/<Name>"`, `tags: ["autodocs"]`, one `Default` story with full Controls. Check each component's autodocs props table renders correctly (per ticket 4's finding, any `cva()`-variant component may need the same `react-docgen-typescript` treatment already configured — that's global in `.storybook/main.ts`, so just verify, don't reconfigure). `form.tsx` (react-hook-form wrapper) and `field.tsx` likely need a small realistic composed example rather than a bare default, per convention #5 (compound components).

## Answer

All 16 stories written, following the [Story authoring conventions](02-story-authoring-conventions.md) template exactly (co-located `*.stories.tsx`, `title: "UI/<Name>"`, `tags: ["autodocs"]`, one `Default` story):

- **Simple, single-element**: `input.stories.tsx`, `textarea.stories.tsx`, `checkbox.stories.tsx`, `switch.stories.tsx`, `slider.stories.tsx`, `label.stories.tsx`, `toggle.stories.tsx`, `kbd.stories.tsx` (also added a `Group` story for `KbdGroup`, since it's a second exported component in the same file).
- **Compound, one realistic composed example** (per convention #5): `radio-group.stories.tsx` (3 options), `select.stories.tsx` (grouped fruit list), `input-otp.stories.tsx` (6-slot OTP with separator), `input-group.stories.tsx` (search input with leading icon + trailing `⌘K` kbd), `field.stories.tsx` (a `FieldSet` with a normal field and an invalid/error field, showing `FieldError`), `toggle-group.stories.tsx` (single-select alignment icons), `button-group.stories.tsx` (segmented buttons + separator + text).
- **`form.stories.tsx`**: a small realistic composed example — `react-hook-form` + `zod` (`zodResolver`) validating one email field through `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`, matching how the app actually uses this component (not a bare prop-driven story, since `Form` is just `FormProvider` and needs a real form context to render meaningfully).

**One deviation, noted per convention**: `input-otp.tsx`'s prop type is a discriminated union from the `input-otp` library (controlled/uncontrolled/render-prop variants), which broke Storybook's `Meta`/`StoryObj` type inference (TS2322 on the story object). Fixed by widening the story's `component` reference to a simple `{ maxLength: number }` shape via a local `InputOTPForStory` cast, used only for Storybook's typing — the actual rendered JSX still calls the real `InputOTP` with its real props, so autodocs' props table (which reads the real source file, not the cast) still shows the full real prop list correctly.

**Verified live in the browser**: sidebar shows all 17 `UI/*` stories (16 new + `Button` from ticket 4). Spot-checked the riskiest ones — `Select` (dropdown opens, shows checked "Banana"), `Form` (renders real email field + submit button, react-hook-form wired), `Field` (both the normal and invalid/error field states render correctly, including the red `FieldError` text), `RadioGroup` (three options, "Comfortable" selected by default), `InputOTP` (6 slots with a visible separator gap) — all correct, no console/server errors. `tsc --noEmit` stayed at the pre-existing 34-error baseline.
