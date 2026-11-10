# Online payment onboarding: reference and implementation

Source: [Pine Onboarding, online flow](https://www.figma.com/design/gTal6M0e7vNU0gZz6lqJuE/Pine-Onboarding?node-id=501-24107).

Both Checkout and Payment links enter the same dedicated onboarding layout at `/onboarding-demo/setup/{product}`. The main platform navigation is absent. Both online products use the same `SetupFrame` workspace as In-store: a full-height rail, rounded content panel, setup header, Save and exit, and bottom actions. The four progress sections are About business, Business verification, KYC, and Review and sign agreement. A shared profile and independent product progress persist in the demo storage namespace.

| Screen | Fields and branches | Source nodes |
| --- | --- | --- |
| PAN verification | Fetch PAN, legal name, linked-mobile OTP, verified state | 501:15200, 501:15724, 501:22640, 501:22883 |
| GST & registered address | Retrieved GSTIN choices, manual GSTIN fetch, address preview | 501:23159, 501:23187, 501:23596 |
| Basic details | Website and Appstore URLs, separate verify and explicit skip choices | 552:27894 |
| Business documents | MoA, AoA, Board resolution, CoI; remove/upload; authenticity declaration | 551:25380, 530:22660 |
| Banking details | Account and confirmation, IFSC; alternate cancelled-cheque upload | 610:9599, 610:9789 |
| Beneficial owners | Yes/no declaration; owner list; PAN fetch, name and percentage sheet | 501:15397, 501:15457, 501:15475, 501:15515, 501:15533 |
| Authorised signatory | Select owner or add person, PAN verification, designation | 501:16330, 501:16351 |
| Political exposure | Exposed, related or neither | 501:16372 |
| Identity | Simulated DigiLocker mobile OTP verification | 501:16392 |
| Video KYC | Four original preparation illustrations, availability, simulated session | 501:15437, 501:15458 |
| Review | Saved values and edit controls for each group | 501:16018 |
| Agreement | Sample MSA, explicit consent, submission gate | 501:16044, 501:16070 |
| Submitted | Success without progress rail, continue to Overview | 610:8625 |

## Reference decisions

- The latest layout direction supersedes the centered online reference shell; the step sequence, fields and original content assets remain.
- The document designs include two-file and extended four-file variants. The prototype requires MoA and AoA, with optional Board resolution and CoI. A business-type condition is not specified in the source.
- The three authorised-signatory screens use inconsistent counters in the source; the implementation uses a coherent three-step counter within that sidebar item.
- The neutral GST preview slot displays sample registry details. PAN fetch, GST fetch, OTP, DigiLocker, video and signing are simulations.
- Uploaded document bytes are not stored or transmitted; only filename, size and type metadata are persisted. Accepted formats and the 5 MB limit follow the reference.
- Video KYC uses the original source images. The session does not access a camera or microphone.
- The agreement is visibly a non-binding demo template.

## Verification

The Node regression suite passes 28 tests covering progression, invalidation, validation, repeat consent, persistence and namespace isolation. Browser checks completed both online products, including manual GST, explicit website/app skips, required file uploads, manual banking and cancelled cheque, owners, signatory, OTP, video, review, signing, refresh, resume and dashboard return. The main `/` still renders its full established-merchant navigation.

The repository has 1,395 existing TypeScript error locations outside these changes. No errors are reported in the changed onboarding files.

## Figma transfer

Completed in [PineOne — Omni-channel](https://www.figma.com/design/8pTOs0aNOMdEPACHnzfrcz/PineOne---Omni-channel?node-id=21560-166), on the page **Progressive onboarding · Web**. The 52 screens use editable text, Pine component instances, vectors and original content images. Five sections cover signup and discovery, shared online verification, branch states, In-store purchase/delivery/setup, and resume/activation/product homes. Prototype entry points are provided for basic signup and each product.

The online screens share the In-store layout and bind their product labels to the selected Checkout or Payment links entry point. Inter is used for editable Figma text because Inter Display is unavailable through the connector. Existing screens were retained, and temporary captures were removed after composition. Exact frame IDs and links are in `docs/exports/onboarding-figma/figma-node-map.json`.
