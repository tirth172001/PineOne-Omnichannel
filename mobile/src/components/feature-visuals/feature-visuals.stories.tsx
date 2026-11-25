import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { AgentCaseScene } from './agents-scene';
import { AgentsCarousel, GuideCarousel } from './carousel';
import { GuideQAScene } from './guide-scene';
import { AGENT_USE_CASES, GUIDE_USE_CASES } from './use-cases';

/**
 * The feature visuals on their own, for working on them: each scene loops,
 * and the carousels play their use cases in turn. Add a use case in
 * use-cases.ts and it shows up here and in What's new.
 */
const meta = {
  title: 'PineOne/Feature visuals',
  decorators: [
    (Story) => (
      <View style={{ padding: 16, gap: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Agents: Story = { render: () => <AgentsCarousel height={248} radius={12} /> };

export const Guide: Story = { render: () => <GuideCarousel height={248} radius={12} dotColor="#0c0c09" /> };

export const AgentScenes: Story = {
  render: () => (
    <>
      {AGENT_USE_CASES.map((useCase) => (
        <AgentCaseScene key={useCase.approvalId} useCase={useCase} height={248} radius={12} />
      ))}
    </>
  ),
};

export const GuideScenes: Story = {
  render: () => (
    <>
      {GUIDE_USE_CASES.map((useCase) => (
        <GuideQAScene key={useCase.question} useCase={useCase} height={248} radius={12} />
      ))}
    </>
  ),
};
