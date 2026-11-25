/**
 * Pine AI agents, as on the web app's Agents page (pine-one.vercel.app/pine-ai,
 * osmosis repo): the marketplace catalogue, the merchant's set-up agents and
 * the actions waiting on them. Copy and figures are the web's, unchanged.
 */

export type AgentId =
  | 'chargeback'
  | 'local-ads'
  | 'campaign-analyzer'
  | 'daily_business_snapshot'
  | 'payment_failure_spike_alert'
  | 'settlement_reconciliation_recon'
  | 'refund_watchman'
  | 'low_payment_volume_alert';

export type AgentCategory = 'payments' | 'sales' | 'risk' | 'settlements';

export const AGENT_CATEGORY_LABELS: Record<AgentCategory, string> = {
  payments: 'Payments',
  sales: 'Sales',
  risk: 'Risk Management',
  settlements: 'Settlements',
};

/** Discover's filter tabs (web: All / Recommended / Payments / Sales). */
export const DISCOVER_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'recommended', label: 'Recommended' },
  { value: 'payments', label: 'Payments' },
  { value: 'sales', label: 'Sales' },
] as const;
export type DiscoverFilter = (typeof DISCOVER_FILTERS)[number]['value'];

export type ConnectorLogo = 'pine-labs' | 'zoho-books' | 'dhl' | 'intercom' | 'google-ads' | 'google' | 'whatsapp';

export type AgentConnector = { name: string; description: string; logo?: ConnectorLogo };

/** The web's step icons (Reicon names), as the app's Phosphor icons. */
export type AgentStepIcon =
  | 'search-status'
  | 'folder-open'
  | 'document-text'
  | 'user-tick'
  | 'link'
  | 'message-search'
  | 'magic-star'
  | 'trend-up'
  | 'chart-success'
  | 'calendar-tick'
  | 'send-square';

export type MarketplaceAgent = {
  id: AgentId;
  /** chat: opens a conversation; app: its own setup flow; task: a scheduled task. */
  kind: 'chat' | 'app' | 'task';
  name: string;
  cardDescription: string;
  section: 'recommended' | 'featured';
  categories: AgentCategory[];
  pricingLabel: string;
  users: string;
  rating: number;
  reviewCount: number;
  successRate: string;
  detail: {
    tagline: string;
    about: string;
    capabilities: { title: string; description: string }[];
    steps: { title: string; description: string; icon?: AgentStepIcon }[];
    connectors: AgentConnector[];
    faqs: { question: string; answer: string }[];
    reviews: { author: string; date: string; rating: number; body: string }[];
    preview: string[];
    previewChat?: { from: 'agent' | 'user'; text: string }[];
  };
};

const PINE_LABS_PAYMENTS: AgentConnector = {
  name: 'Pine Labs Payments',
  description: 'Access transaction details and payment records.',
  logo: 'pine-labs',
};
const PINE_LABS_SETTLEMENTS: AgentConnector = {
  name: 'Pine Labs Settlements',
  description: 'Read settlement batches, credits and deductions.',
  logo: 'pine-labs',
};

export const AGENT_OF_THE_WEEK_ID: AgentId = 'daily_business_snapshot';

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  {
    id: 'chargeback',
    kind: 'chat',
    name: 'Chargeback Agent',
    cardDescription: 'Investigates disputes, collects evidence, and prepares responses to protect your earnings.',
    section: 'recommended',
    categories: ['risk', 'payments'],
    pricingLabel: '₹12 per chargeback',
    users: '1.2k',
    rating: 4,
    reviewCount: 12,
    successRate: '100%',
    detail: {
      tagline:
        'Your AI-powered dispute assistant that helps you manage chargebacks effortlessly. It investigates disputed transactions, gathers supporting evidence, and prepares responses to help you protect your earnings.',
      about:
        'The Chargeback Agent helps you handle payment disputes without the manual effort. It understands why a transaction was disputed, collects relevant evidence, and prepares responses on your behalf—helping you save time and protect your revenue.',
      capabilities: [
        { title: 'Understand disputes instantly', description: 'Automatically analyses chargebacks, explains dispute reasons, and identifies the actions required.' },
        { title: 'Gather supporting evidence', description: 'Collects transaction records, payment details, and relevant documents to help build your case.' },
        { title: 'Prepare dispute responses', description: 'Creates evidence-backed responses for your review, helping you challenge eligible chargebacks with confidence.' },
      ],
      steps: [
        { title: 'Review chargeback', description: 'Spots new chargebacks, explains the reason and flags cases close to their deadline.', icon: 'search-status' },
        { title: 'Gather evidence', description: 'Pulls chargeslips, payment records, invoices and delivery proof from your connected tools.', icon: 'folder-open' },
        { title: 'Prepare response', description: 'Drafts a rebuttal letter with every document attached, ready for you to check.', icon: 'document-text' },
        { title: 'Approve and submit', description: 'You sign and approve the letter. The agent emails it and tracks the case until the bank decides.', icon: 'user-tick' },
      ],
      connectors: [
        PINE_LABS_PAYMENTS,
        { name: 'ZOHO Books', description: 'Access invoices, order details, and delivery information.', logo: 'zoho-books' },
        { name: 'DHL Delivery', description: 'Access shipment tracking, delivery status, and proof of delivery.', logo: 'dhl' },
        { name: 'Intercom Customer Support', description: 'Retrieve customer interactions and supporting communications.', logo: 'intercom' },
      ],
      faqs: [
        { question: 'What is a chargeback?', answer: 'A chargeback occurs when a customer disputes a transaction with their bank, potentially resulting in a payment reversal.' },
        { question: 'Can the agent help recover my money?', answer: 'Yes. The agent builds an evidence-backed rebuttal for eligible chargebacks. If the bank rules in your favour, the amount is credited back in your next settlement.' },
        { question: 'Will the agent automatically respond to disputes?', answer: 'No. The agent prepares the response, but nothing is sent to the bank until you review and approve it.' },
        { question: 'What happens if additional evidence is needed?', answer: 'The agent tells you exactly what is missing and asks to connect the right tool, or lets you upload the document yourself.' },
        { question: 'Can I track my chargeback status?', answer: 'Yes. Every case shows its deadline and status, and the agent messages you as soon as the bank decides.' },
      ],
      reviews: [
        {
          author: 'Kavya Fashion House',
          date: 'April 15, 2024',
          rating: 5,
          body: 'The Chargeback Agent saved us hours of manual work. It quickly identified disputed transactions and helped us prepare strong responses. Highly recommend for any Indian e-commerce business.',
        },
        {
          author: 'Gunsbery Drinks',
          date: 'April 15, 2024',
          rating: 5,
          body: 'This tool is a game changer for our payment dispute process. It gathered all necessary evidence automatically and made responding to chargebacks much easier. Our recovery rate has improved significantly.',
        },
      ],
      preview: [
        'You have 3 chargebacks requiring attention, worth ₹9,997.',
        "I've gathered the evidence for CB-24116 (₹4,299) and CB-24118 (₹2,199). CB-24117 for ₹3,499 is due first, on 16 Oct.",
        "I've prepared a response for your review.",
      ],
    },
  },
  {
    id: 'local-ads',
    kind: 'app',
    name: 'Market Agent',
    cardDescription: 'Describe your business and the agent creates, launches and optimises Google Ads that bring customers to your store.',
    section: 'recommended',
    categories: ['sales'],
    pricingLabel: 'Free · you pay Google for ad spend',
    users: '2.4k',
    rating: 4,
    reviewCount: 312,
    successRate: '92%',
    detail: {
      tagline:
        'Turn Google searches into store visits. The agent researches your market, writes the ads, makes the creatives and keeps tuning them, with your approval at every step.',
      about:
        'Market Agent helps your store reach the right customers on Google without managing complicated campaigns. Describe your business in plain words and the agent builds a Search, Performance Max or Demand Gen campaign with keywords, copy and creatives, then keeps optimising budget and keywords on live performance.',
      capabilities: [
        { title: 'Build the campaign for you', description: 'Picks the campaign type for your goal and writes keywords, headlines and descriptions from your brief.' },
        { title: 'Generate creatives', description: 'Makes image and video creatives in the right sizes for Search, YouTube, Discover and Gmail.' },
        { title: 'Keep optimising', description: 'Tunes budget, keywords and creatives on live results, and flags anything that needs your approval.' },
      ],
      steps: [
        { title: 'Link Google Ads', description: 'Sign in with Google and pick the Ads account to use. Only one account is active at a time.', icon: 'link' },
        { title: 'Describe your business', description: 'Tell the agent what you sell, where your stores are and what you want more of.', icon: 'message-search' },
        { title: 'Review and publish', description: 'Check the keywords, copy and creatives the agent prepared, then publish in one tap.', icon: 'magic-star' },
        { title: 'Optimise', description: 'The agent keeps tuning the campaign and reports results in Campaigns.', icon: 'trend-up' },
      ],
      connectors: [
        { name: 'Google Ads', description: 'Create campaigns, publish ads and read performance.', logo: 'google-ads' },
        PINE_LABS_PAYMENTS,
        { name: 'Google Business Profile', description: 'Use your store addresses, hours and reviews in ads.', logo: 'google' },
        { name: 'WhatsApp Business', description: 'Send leads and campaign updates to your phone.', logo: 'whatsapp' },
      ],
      faqs: [
        { question: 'Do I need to know Google Ads?', answer: 'No. Describe your business in plain words and the agent sets up the campaign. You approve everything before it goes live.' },
        { question: 'How much does it cost?', answer: 'The agent is free. You set a daily budget and pay Google directly for the ad spend.' },
        { question: 'Which campaign types are supported?', answer: 'Search, Performance Max and Demand Gen. The agent recommends one based on your goal, like store visits or calls.' },
        { question: 'Can I pause or change a campaign?', answer: 'Yes. Pause, edit or end any campaign from Campaigns at any time.' },
      ],
      reviews: [
        { author: 'Sugar & Spice Bakery', date: 'May 6, 2024', rating: 5, body: 'Set up my first Google Ads in 6 minutes. Weekend cake orders doubled by the second week.' },
        { author: 'Bloom Salon', date: 'April 30, 2024', rating: 4, body: "Never understood keywords. Now I don't have to. It just brings walk-ins to my salon." },
      ],
      preview: [
        'Your Diwali gift hampers campaign reached 12,400 people near HSR Layout this week.',
        'Calls are up 2.1× and store visits up 38% since launch.',
        "I've moved ₹300 of budget to your best-performing keywords.",
      ],
    },
  },
  {
    id: 'campaign-analyzer',
    kind: 'chat',
    name: 'Campaign Analyzer Agent',
    cardDescription: 'Reviews your Meta Ads and shows how each campaign did against the period before.',
    section: 'recommended',
    categories: ['sales'],
    pricingLabel: 'Free',
    users: '640',
    rating: 4,
    reviewCount: 58,
    successRate: '97%',
    detail: {
      tagline: 'See how each Meta Ads campaign did this week, compared with the week before, from one read-only connection.',
      about:
        "Campaign Analyzer Agent reads one Meta ad account and reports spend, delivery and leads for the account and each campaign, as daily, weekly, monthly or custom reviews. The figures are calculated the same way every time and compared with the preceding period. It reports what Meta returns: it doesn't calculate sales or ROAS, and it can't change your campaigns.",
      capabilities: [
        { title: 'Account information', description: "Reads the configured Meta account's ID, name, status, currency and timezone." },
        { title: 'Campaign inventory', description: "Lists each campaign's name, objective, status and dates." },
        { title: 'Campaign insights', description: 'Reads summary or daily metrics for chosen campaigns, with breakdowns like age, region and device.' },
        { title: 'Performance review', description: 'Calculates account and campaign metrics, compares them with the previous period and notes any data gaps.' },
      ],
      steps: [
        { title: 'Connect Meta', description: 'Connect through Meta or enter an access token, and choose one ad account.', icon: 'link' },
        { title: 'Ask for a review', description: 'Ask for a daily, weekly, monthly or custom period, or for one campaign.', icon: 'message-search' },
        { title: 'Read the report', description: 'See spend, leads and cost per lead by campaign, against the period before.', icon: 'chart-success' },
      ],
      connectors: [{ name: 'Meta Ads', description: "Read one ad account's campaigns and performance. Read-only (ads_read)." }],
      faqs: [
        { question: 'Can it pause or change my campaigns?', answer: 'No. It only has read access to your Meta account, so changes stay in Meta Ads Manager.' },
        { question: 'Does it show sales or ROAS?', answer: 'No. This report does not calculate revenue, sales, ROAS, or payment attribution. Leads are as Meta reports them.' },
        { question: 'Which ad platforms does it cover?', answer: 'Meta Ads, for one connected ad account.' },
        { question: 'What period does it compare against?', answer: 'The immediately preceding period of the same length.' },
      ],
      reviews: [],
      preview: [
        'Last week you spent ₹2,800 on Meta Ads and got 77 leads.',
        'Leads are down 21.43% and cost per lead is up 49.69%.',
        'Diwali gift hampers got the most leads: 35 at ₹20 each.',
      ],
    },
  },
  {
    id: 'daily_business_snapshot',
    kind: 'task',
    name: 'Snapshot',
    cardDescription: 'Runs every day and prepares a daily summary of business performance across stores and methods.',
    section: 'recommended',
    categories: ['sales'],
    pricingLabel: 'Free',
    users: '3.7k',
    rating: 3,
    reviewCount: 847,
    successRate: '99%',
    detail: {
      tagline: 'A daily business summary across your stores, transaction trends and payment methods, delivered before you open.',
      about:
        "Snapshot reviews yesterday's performance every morning and tells you what changed: sales by store, success rates, payment method mix and anything that needs a look. You start the day knowing where to focus, without opening a single report.",
      capabilities: [
        { title: 'Summarise yesterday', description: 'Totals, success rate and average ticket size for every store, in one short message.' },
        { title: 'Spot what changed', description: 'Highlights stores and payment methods that moved meaningfully versus last week.' },
        { title: 'Suggest next steps', description: 'Points out the one or two things worth acting on today, like a store to call or a device to check.' },
      ],
      steps: [
        { title: 'Pick stores and time', description: 'Choose the stores, payment methods and the time you want your summary.', icon: 'calendar-tick' },
        { title: 'Read your data', description: 'Every night the agent reads your Pine Labs transactions and settlements.', icon: 'folder-open' },
        { title: 'Spot what changed', description: 'Compares yesterday with last week and flags the stores or methods that moved.', icon: 'chart-success' },
        { title: 'Deliver the summary', description: 'A short summary lands in Guide before you open, and on WhatsApp if you like.', icon: 'send-square' },
      ],
      connectors: [
        PINE_LABS_PAYMENTS,
        PINE_LABS_SETTLEMENTS,
        { name: 'ZOHO Books', description: 'Read sales invoices and returns for each store.', logo: 'zoho-books' },
        { name: 'WhatsApp Business', description: 'Send the daily summary to you and your store managers.', logo: 'whatsapp' },
      ],
      faqs: [
        { question: 'When does the summary arrive?', answer: 'At the time you choose when scheduling the task, every day. Most merchants pick 8 am.' },
        { question: 'Can I choose which stores are included?', answer: 'Yes. You can include all stores or pick specific ones, and change this anytime.' },
        { question: 'What counts as a meaningful change?', answer: 'The agent compares each store with its own last four weeks, so it only flags moves that are unusual for that store.' },
        { question: 'Can my store managers get it too?', answer: 'Yes. Connect WhatsApp Business and add their numbers. Each manager can get only their own store.' },
        { question: 'Can I pause it?', answer: 'Yes. Pause or resume it anytime from Scheduled tasks.' },
      ],
      reviews: [
        {
          author: 'Anand Sweets',
          date: 'May 2, 2024',
          rating: 4,
          body: 'The morning summary is the first thing I read. It is short and tells me which store to call. We caught a broken terminal at one branch before the weekend rush.',
        },
        {
          author: 'Urban Brew Cafe',
          date: 'April 28, 2024',
          rating: 5,
          body: 'I run four outlets and used to check each dashboard every morning. Now one message tells me how yesterday went and what to look at first.',
        },
      ],
      preview: [
        'Yesterday you processed ₹4.8L across 6 stores, up 6% on last week.',
        "Whitefield's UPI success rate dropped to 91%. Worth a check.",
        "I've shared the full store-wise summary in Guide.",
      ],
      previewChat: [
        { from: 'agent', text: 'Good morning! Yesterday you processed ₹4.8L across 6 stores, up 6% on last week.' },
        { from: 'user', text: 'Nice. Anything I should check?' },
        { from: 'agent', text: "Whitefield's UPI success rate dropped to 91%. Worth a call to the store." },
        { from: 'user', text: 'Thanks, calling them now 👍' },
      ],
    },
  },
  {
    id: 'payment_failure_spike_alert',
    kind: 'task',
    name: 'Spike Alert',
    cardDescription: 'Detects when payment failures increase meaningfully versus the merchant’s normal baseline.',
    section: 'recommended',
    categories: ['payments', 'risk'],
    pricingLabel: 'Free',
    users: '5.1k',
    rating: 2,
    reviewCount: 615,
    successRate: '97%',
    detail: {
      tagline: 'Alerts you when payment failures rise above your normal baseline, split by store, device and method.',
      about:
        'Spike Alert watches failure rates continuously and only alerts you when something is genuinely off, so you can fix a terminal or network issue before it costs sales.',
      capabilities: [
        { title: 'Learn your baseline', description: 'Understands normal failure rates for each store, device and payment method.' },
        { title: 'Detect spikes', description: 'Flags meaningful increases instead of everyday noise.' },
        { title: 'Point to the cause', description: 'Shows whether a device, a method or a bank is behind the spike.' },
      ],
      steps: [
        { title: 'Set up', description: 'Choose the stores and the sensitivity you want.' },
        { title: 'Monitor', description: 'The agent compares live failures with your baseline.' },
        { title: 'Alert', description: 'You get an alert with the likely cause and a suggested fix.' },
      ],
      connectors: [PINE_LABS_PAYMENTS],
      faqs: [
        { question: 'How is a spike defined?', answer: 'A meaningful increase over the usual failure rate for that store, device and method at that time of day.' },
        { question: 'Will I get too many alerts?', answer: 'No. Alerts are grouped and only sent when the change is significant.' },
      ],
      reviews: [{ author: 'GD Electronics', date: 'March 9, 2024', rating: 3, body: 'Caught a faulty terminal at our MG Road store within the hour.' }],
      preview: ['Card failures at Koramangala are 3x higher than usual in the last hour.', 'Most failures come from device DEV-104.'],
    },
  },
  {
    id: 'settlement_reconciliation_recon',
    kind: 'task',
    name: 'Transaction & Settlement Recon',
    cardDescription: 'Runs after the latest settlement and prepares transaction-level reconciliation for the merchant.',
    section: 'featured',
    categories: ['settlements', 'payments'],
    pricingLabel: 'Free',
    users: '2.9k',
    rating: 4,
    reviewCount: 274,
    successRate: '99%',
    detail: {
      tagline: 'Reconciles every settlement against your transactions and flags anything that does not match.',
      about:
        'After each settlement lands, the agent matches it to the underlying transactions, explains deductions and lists exceptions that need your attention.',
      capabilities: [
        { title: 'Match settlements', description: 'Ties each settlement credit back to its transactions.' },
        { title: 'Explain deductions', description: 'Breaks down MDR, refunds, chargebacks and holds.' },
        { title: 'Flag exceptions', description: 'Lists unmatched or short-settled transactions for review.' },
      ],
      steps: [
        { title: 'Trigger', description: 'Runs automatically after each settlement.' },
        { title: 'Reconcile', description: 'Matches settlement lines with transaction records.' },
        { title: 'Report', description: 'Sends a summary with exceptions to review.' },
      ],
      connectors: [PINE_LABS_SETTLEMENTS, PINE_LABS_PAYMENTS],
      faqs: [
        { question: 'When does the reconciliation run?', answer: 'Shortly after each settlement is credited to your bank account.' },
        { question: 'What counts as an exception?', answer: 'Any transaction that is missing, short-settled or deducted without a matching reason.' },
      ],
      reviews: [{ author: 'Apollo Stores', date: 'February 21, 2024', rating: 4, body: 'Our finance team stopped doing this in spreadsheets.' }],
      preview: ['Settlement of ₹48,320 matched 312 of 314 transactions.', '2 transactions worth ₹1,940 are short-settled.'],
    },
  },
  {
    id: 'refund_watchman',
    kind: 'task',
    name: 'Refund Watchman',
    cardDescription: 'Runs daily refund analysis and detects refund spikes by store and method.',
    section: 'featured',
    categories: ['payments', 'risk'],
    pricingLabel: 'Free',
    users: '7.3k',
    rating: 1,
    reviewCount: 983,
    successRate: '96%',
    detail: {
      tagline: 'Watches refunds every day and flags unusual spikes by store and payment method.',
      about: 'Refund Watchman analyses refunds daily so you notice misuse or operational issues early, before they add up.',
      capabilities: [
        { title: 'Track refunds', description: 'Daily refund counts and values for every store.' },
        { title: 'Detect spikes', description: 'Flags stores or methods with unusual refund activity.' },
        { title: 'Highlight patterns', description: 'Shows repeat customers, cashiers or times behind refunds.' },
      ],
      steps: [
        { title: 'Schedule', description: 'Choose when the daily check runs.' },
        { title: 'Analyse', description: "The agent reviews yesterday's refunds against your normal levels." },
        { title: 'Alert', description: 'You get a summary and alerts for anything unusual.' },
      ],
      connectors: [PINE_LABS_PAYMENTS],
      faqs: [
        { question: 'Does it block refunds?', answer: 'No. It only analyses refunds and alerts you.' },
        { question: 'Can I change what counts as unusual?', answer: 'Yes. Adjust the threshold when configuring the task.' },
      ],
      reviews: [{ author: 'Sandowitch', date: 'January 12, 2024', rating: 2, body: 'Useful, but I would like fewer alerts on weekends.' }],
      preview: ['Refunds at HSR Layout were ₹6,200 yesterday, 4x the usual.', 'Most were UPI refunds between 8 and 9 pm.'],
    },
  },
  {
    id: 'low_payment_volume_alert',
    kind: 'task',
    name: 'Volume Alert',
    cardDescription: 'Detects when transaction count or value drops sharply for a store during its usual active hours.',
    section: 'featured',
    categories: ['sales'],
    pricingLabel: 'Free',
    users: '4.6k',
    rating: 3,
    reviewCount: 761,
    successRate: '98%',
    detail: {
      tagline: 'Alerts you when a store goes unusually quiet during its normal business hours.',
      about:
        "Volume Alert learns each store's usual rhythm and tells you when transactions drop sharply, which often means a device is offline or the store is closed unexpectedly.",
      capabilities: [
        { title: 'Learn store rhythm', description: 'Understands normal volume by store, day and hour.' },
        { title: 'Detect drops', description: 'Flags sharp drops in count or value during active hours.' },
        { title: 'Suggest checks', description: 'Points to devices that went quiet so you can follow up.' },
      ],
      steps: [
        { title: 'Set up', description: 'Choose stores and active hours.' },
        { title: 'Monitor', description: 'The agent compares live volume with the usual pattern.' },
        { title: 'Alert', description: 'You get an alert when a store goes unusually quiet.' },
      ],
      connectors: [PINE_LABS_PAYMENTS],
      faqs: [
        { question: 'What is a sharp drop?', answer: "A significant fall in transactions compared with that store's usual level for the same hour." },
        { question: 'Does it work for new stores?', answer: "It needs about two weeks of history to learn a store's pattern." },
      ],
      reviews: [{ author: 'Asha Stores', date: 'March 30, 2024', rating: 3, body: 'Told us a terminal was offline before the store manager noticed.' }],
      preview: ['Jayanagar has had no card transactions for 45 minutes during peak hours.', 'Device DEV-105 last synced at 6:12 pm.'],
    },
  },
];

export function getMarketplaceAgent(id: string) {
  return MARKETPLACE_AGENTS.find((agent) => agent.id === id) ?? null;
}

export type AgentStatus = 'Live' | 'Inactive' | 'Paused';

/** The merchant's set-up agents, in the web's order. */
export const MY_AGENTS: { id: AgentId; status: AgentStatus }[] = [
  { id: 'chargeback', status: 'Live' },
  { id: 'local-ads', status: 'Live' },
  { id: 'campaign-analyzer', status: 'Live' },
  { id: 'daily_business_snapshot', status: 'Live' },
  { id: 'payment_failure_spike_alert', status: 'Inactive' },
];

export type PendingApproval = {
  id: string;
  agentId: AgentId;
  title: string;
  detail: string;
  dueInDays: number;
  /** The step the agent prepared, and its button. */
  step: string;
  actionLabel: string;
  /** What's confirmed once it's approved. */
  approvedMessage: string;
};

/** Actions an agent is waiting on the merchant for (web: APPROVALS), soonest due first. */
export const PENDING_APPROVALS: PendingApproval[] = (
  [
    {
      id: 'ap-cb-24119',
      agentId: 'chargeback',
      title: 'CB-24119 · ₹1,299',
      detail: 'Not as described · Bandra',
      dueInDays: 1,
      step: 'Add refund policy',
      actionLabel: 'Use website policy',
      approvedMessage: 'Refund policy added; CB-24119 rebuttal submitted',
    },
    {
      id: 'ap-cb-24118',
      agentId: 'chargeback',
      title: 'CB-24118 · ₹2,199',
      detail: 'Transaction not recognised · Bandra',
      dueInDays: 4,
      step: 'Submit rebuttal',
      actionLabel: 'Approve and submit',
      approvedMessage: 'Rebuttal for CB-24118 submitted to HDFC Bank',
    },
    {
      id: 'ap-cb-24116',
      agentId: 'chargeback',
      title: 'CB-24116 · ₹4,299',
      detail: 'Transaction not recognised · Koramangala',
      dueInDays: 5,
      step: 'Submit rebuttal',
      actionLabel: 'Approve and submit',
      approvedMessage: 'Rebuttal for CB-24116 submitted to HDFC Bank',
    },
    {
      id: 'ap-snap-indiranagar',
      agentId: 'daily_business_snapshot',
      title: 'Indiranagar sales 18% below normal',
      detail: 'Sunday, 18 Oct · card payments fell after 4 pm',
      dueInDays: 3,
      step: 'Review the dip',
      actionLabel: 'Review',
      approvedMessage: 'Marked as reviewed',
    },
    {
      id: 'ap-ads-budget',
      agentId: 'local-ads',
      title: 'Budget runs out on Thursday',
      detail: 'Diwali Gift Hampers · ₹1,500 a day',
      dueInDays: 3,
      step: 'Raise the budget',
      actionLabel: 'Raise to ₹2,000',
      approvedMessage: 'Daily budget raised to ₹2,000',
    },
    {
      id: 'ap-spike-bandra',
      agentId: 'payment_failure_spike_alert',
      title: 'UPI failures spiking',
      detail: 'Success rate 98% → 91% in 2 hours · Bandra',
      dueInDays: 0,
      step: 'Restart device',
      actionLabel: 'Restart device',
      approvedMessage: 'Restart sent to the Bandra terminal',
    },
    {
      id: 'ap-spike-koramangala',
      agentId: 'payment_failure_spike_alert',
      title: 'Card declines rising',
      detail: 'Declines up 2.4× since 10 am · Koramangala',
      dueInDays: 0,
      step: 'Check card network',
      actionLabel: 'Switch acquirer',
      approvedMessage: 'Koramangala terminal switched to the backup acquirer',
    },
  ] satisfies PendingApproval[]
).sort((a, b) => a.dueInDays - b.dueInDays);

export function findApproval(id: string) {
  return PENDING_APPROVALS.find((approval) => approval.id === id);
}

export function pendingApprovals(agentId?: AgentId) {
  return PENDING_APPROVALS.filter((approval) => !agentId || approval.agentId === agentId);
}
