import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

import { AccessScopeBadge, RoleBadge, RolePermissionsPreview, RoleTypeChip, UserStatusBadge } from '@/components/account/account-ui';
import { AcceptDisputeDialog } from '@/components/disputes/dispute-sheets';
import { ColorPickerSheet } from '@/components/products/color-picker-sheet';
import { ModePill } from '@/components/products/terminal-devices';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { QrPreview } from '@/components/shared/qr-preview';
import { getUserManagement } from '@/data/user-management';

import { MoreMenu } from './more-menu';

const meta = {
  title: 'PineOne/More',
  component: MoreMenu,
  parameters: {
    docs: {
      description: {
        component:
          'More tab (web: the sidebar destinations without their own tab): the menu, and the building blocks used by Disputes, Products (terminal devices, payment links, checkout), Manage store, Users & roles and Account settings.',
      },
    },
  },
} satisfies Meta<typeof MoreMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Menu: Story = {};

export const Badges: Story = {
  render: () => (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <RoleBadge role="Admin" />
      <RoleBadge role="Owner" />
      <UserStatusBadge status="Active" />
      <UserStatusBadge status="Invited" />
      <UserStatusBadge status="Deactivated" />
      <AccessScopeBadge scope="In-store and Online" />
      <RoleTypeChip roleType="system_default" />
      <RoleTypeChip roleType="custom" />
      <ModePill mode="Integrated" />
      <ModePill mode="Standalone" />
    </View>
  ),
};

export const RolePreview: Story = {
  render: () => <RolePermissionsPreview role={getUserManagement().roleCatalog.find((role) => role.name === 'Store Manager')} />,
};

export const StoreQr: Story = {
  render: () => <QrPreview seed="STR-738723324017" backgroundColor="#053B29" upiId="6352699747@ptyes" radius={12} />,
};

function OverlaysDemo() {
  const [open, setOpen] = useState<'confirm' | 'accept' | 'color' | null>(null);
  const [color, setColor] = useState<string | null>(null);
  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button mode="outlined" onPress={() => setOpen('confirm')}>
        Confirm dialog
      </Button>
      <Button mode="outlined" onPress={() => setOpen('accept')}>
        Accept dispute
      </Button>
      <Button mode="outlined" onPress={() => setOpen('color')}>
        Colour picker {color ?? ''}
      </Button>
      <ConfirmDialog
        visible={open === 'confirm'}
        onDismiss={() => setOpen(null)}
        title="Deactivate Karan Joshi?"
        description="This user's access will be deactivated immediately. You can reactivate them later from the Users list."
        confirmLabel="Deactivate user"
        onConfirm={() => {}}
        destructive
      />
      <AcceptDisputeDialog visible={open === 'accept'} onDismiss={() => setOpen(null)} amount="₹ 15,000" onConfirm={() => {}} />
      <ColorPickerSheet visible={open === 'color'} onDismiss={() => setOpen(null)} value={color} onChange={setColor} title="Checkout primary color" />
    </View>
  );
}

export const Overlays: Story = { render: () => <OverlaysDemo /> };
