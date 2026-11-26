import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DetailScreen } from '@/components/shared/detail-screen';
import { TabScreen } from '@/components/tab-screen';
import { PanelSheet } from '@/components/shared/panel-sheet';
import { QR_BACKGROUND_SWATCHES, QrPreview } from '@/components/shared/qr-preview';
import { OptionCard, SheetBlock, SheetButton, SheetRow, SheetSuccess } from '@/components/shared/sheet-parts';
import { Shape } from '@/constants/shape';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import { formatInr } from '@/data/common';
import { type Product, PRODUCTS } from '@/data/profile';
import { useBusiness } from '@/hooks/use-business';
import { useToast } from '@/hooks/use-toast';

import { FooterButton, Note, profileStyles } from './profile-ui';

const rupees = (amount: number) => formatInr(amount).split('.')[0];

/**
 * Accept payments (profile → Rewards): the old app's SQR page — the store's
 * UPI QR to show at the counter, per store, with its colour, and Download
 * or Share to print it.
 */
export function AcceptPayments({ asTab = false }: { asTab?: boolean }) {
  const theme = useTheme();
  const toast = useToast();
  const { organisation } = useBusiness();
  const shops = organisation.shops;
  const [shopId, setShopId] = useState(shops[0]?.id);
  const [colour, setColour] = useState<string>(QR_BACKGROUND_SWATCHES[0]);
  const [picking, setPicking] = useState(false);
  const shop = shops.find((item) => item.id === shopId) ?? shops[0];
  const upiId = `${organisation.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}.${(shop?.name ?? 'store').toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}@pinelabs`;

  const share = () => Share.share({ message: `Pay ${organisation.name} – ${shop?.name} by UPI: ${upiId}` });
  const download = () => toast('QR saved to your photos');

  const body = (
    <>
      <View style={[profileStyles.stack, !asTab && profileStyles.first]}>
        <TouchableRipple
          onPress={() => setPicking(true)}
          borderless
          accessibilityRole="button"
          accessibilityLabel={`Store, ${shop?.name}. Change store`}
          style={[styles.storeCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.storeRow}>
            <Icon source="storefront" size={24} color={theme.colors.primary} />
            <View style={profileStyles.flex}>
              <Text numberOfLines={1} style={[profileStyles.medium, { color: theme.colors.onSurface }]}>
                {shop?.name}
              </Text>
              <Text numberOfLines={1} style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>
                {shop?.address}
              </Text>
            </View>
            {shops.length > 1 ? <Text style={[profileStyles.medium, { color: theme.colors.primary }]}>Change</Text> : null}
          </View>
        </TouchableRipple>

        <View style={[profileStyles.card, { backgroundColor: theme.colors.surface }]}>
          <QrPreview seed={`${shop?.id}-${colour}`} backgroundColor={colour} upiId={upiId} radius={Shape.max} />
          <Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>QR colour</Text>
          <View accessibilityRole="radiogroup" style={styles.swatches}>
            {QR_BACKGROUND_SWATCHES.map((swatch) => {
              const active = swatch === colour;
              return (
                <TouchableRipple
                  key={swatch}
                  onPress={() => setColour(swatch)}
                  borderless
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`Colour ${swatch}`}
                  style={[styles.swatch, { borderColor: active ? theme.colors.primary : theme.colors.outlineVariant }]}>
                  <View style={[styles.swatchFill, { backgroundColor: swatch }]} />
                </TouchableRipple>
              );
            })}
          </View>
        </View>
        <Note icon="qr-code">Customers scan with any UPI app. Payments show up in Payments as In-store · UPI, and settle with the rest of the store’s sales.</Note>
      </View>

      <PanelSheet visible={picking} onDismiss={() => setPicking(false)} title="Select store" fit>
        <SheetBlock last>
          {shops.map((item) => (
            <OptionCard
              key={item.id}
              icon="storefront"
              title={item.name}
              description={item.address}
              selected={item.id === shop?.id}
              onPress={() => {
                setShopId(item.id);
                setPicking(false);
              }}
            />
          ))}
        </SheetBlock>
      </PanelSheet>
    </>
  );

  // The UPI tab (GD Electronics' floating bar): the same QR as a tab root, Share and Download in the header.
  if (asTab)
    return (
      <TabScreen
        tab="upi"
        actions={[
          { label: 'Share', icon: 'share-network', onPress: share },
          { label: 'Download', icon: 'download-simple', onPress: download },
        ]}>
        {body}
      </TabScreen>
    );

  return (
    <DetailScreen
      title="Accept payments"
      fallbackHref="/"
      footer={
        <>
          <FooterButton label="Share" mode="outlined" icon="share-network" onPress={share} />
          <FooterButton label="Download" icon="download-simple" onPress={download} />
        </>
      }>
      {body}
    </DetailScreen>
  );
}

const CATEGORIES = ['All', 'Supplies', 'Accessories', 'Devices'] as const;

/**
 * Marketplace (profile → Rewards): the old app's Pine Store (a web view
 * there) — supplies, accessories and devices for the counter, added to a
 * cart, ordered to a store, paid from the next settlement.
 */
export function Marketplace() {
  const theme = useTheme();
  const { organisation } = useBusiness();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);
  const items = PRODUCTS.filter((product) => category === 'All' || product.category === category);
  const lines = PRODUCTS.filter((product) => cart[product.id]);
  const count = lines.reduce((sum, product) => sum + cart[product.id], 0);
  const total = lines.reduce((sum, product) => sum + cart[product.id] * product.price, 0);
  const change = (id: string, delta: number) => setCart((current) => ({ ...current, [id]: Math.max(0, Math.min(10, (current[id] ?? 0) + delta)) }));

  return (
    <DetailScreen title="Marketplace" fallbackHref="/" footer={count > 0 ? <FooterButton label={`Checkout · ${count} item${count > 1 ? 's' : ''} · ${rupees(total)}`} onPress={() => setCheckout(true)} /> : undefined}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, profileStyles.first]}>
        {CATEGORIES.map((item) => {
          const active = item === category;
          return (
            <TouchableRipple
              key={item}
              onPress={() => setCategory(item)}
              borderless
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.chip, { backgroundColor: active ? theme.colors.onSurface : theme.colors.surface }]}>
              <Text style={[profileStyles.medium, { color: active ? theme.colors.surface : theme.colors.onSurface }]}>{item}</Text>
            </TouchableRipple>
          );
        })}
      </ScrollView>
      <View style={styles.grid}>
        {items.map((product) => (
          <ProductCard key={product.id} product={product} quantity={cart[product.id] ?? 0} onChange={(delta) => change(product.id, delta)} />
        ))}
      </View>

      <PanelSheet
        visible={checkout}
        onDismiss={() => setCheckout(false)}
        title={placed ? 'Order placed' : 'Review order'}
        fit
        footer={
          placed ? (
            <SheetButton
              label="Done"
              onPress={() => {
                setCheckout(false);
                setPlaced(null);
                setCart({});
              }}
            />
          ) : (
            <SheetButton label={`Place order · ${rupees(total)}`} onPress={() => setPlaced(`ORD-${48210 + Math.floor(Math.random() * 900)}`)} />
          )
        }>
        {placed ? (
          <SheetSuccess title={`Order ${placed} placed`} body={`We'll deliver to ${organisation.shops[0]?.name} in 3–5 working days. ${rupees(total)} will be adjusted from your next settlement.`} />
        ) : (
          <>
            <SheetBlock>
              {lines.map((product) => (
                <SheetRow key={product.id} label={`${product.name} × ${cart[product.id]}`} value={rupees(product.price * cart[product.id])} />
              ))}
              <SheetRow label="Delivery" value="Free" />
              <SheetRow label="Total" value={rupees(total)} strong />
            </SheetBlock>
            <SheetBlock last>
              <SheetRow label="Deliver to" value={organisation.shops[0]?.name ?? ''} />
              <SheetRow label="Pay with" value="Next settlement" />
            </SheetBlock>
          </>
        )}
      </PanelSheet>
    </DetailScreen>
  );
}

/** A product as a grid card: the photo large on grey, name and what it is, price, then Add or the quantity. */
function ProductCard({ product, quantity, onChange }: { product: Product; quantity: number; onChange: (delta: number) => void }) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };
  const off = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  return (
    <View style={[styles.product, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.productImage, { backgroundColor: theme.colors.background }]}>
        {product.image ? (
          <Image source={product.image} contentFit="contain" style={styles.photo} accessibilityLabel={product.name} />
        ) : (
          <Icon source={product.icon} size={56} color={theme.colors.primary} />
        )}
        {off > 0 ? (
          <View style={[styles.off, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.offText, { color: theme.colors.onPrimary }]}>{off}% off</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.productText}>
        <Text numberOfLines={2} style={[profileStyles.medium, { color: theme.colors.onSurface }]}>
          {product.name}
        </Text>
        <Text numberOfLines={2} style={[profileStyles.small, muted]}>
          {product.line}
        </Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: theme.colors.onSurface }]}>{rupees(product.price)}</Text>
        {product.mrp ? <Text style={[profileStyles.small, styles.strike, muted]}>{rupees(product.mrp)}</Text> : null}
      </View>
      {quantity === 0 ? (
        <SheetButton mode="outline" icon="plus" label="Add" onPress={() => onChange(1)} />
      ) : (
        <View style={[styles.stepper, { backgroundColor: theme.colors.primary }]}>
          <IconButton icon="minus" size={16} iconColor={theme.colors.onPrimary} onPress={() => onChange(-1)} accessibilityLabel={`One less ${product.name}`} style={styles.stepButton} />
          <Text style={[styles.qty, { color: theme.colors.onPrimary }]}>{quantity}</Text>
          <IconButton icon="plus" size={16} iconColor={theme.colors.onPrimary} onPress={() => onChange(1)} accessibilityLabel={`One more ${product.name}`} style={styles.stepButton} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  storeCard: { borderRadius: Shape.max },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  swatches: { flexDirection: 'row', gap: 10 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, padding: 3 },
  swatchFill: { flex: 1, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.15)' },
  chips: { gap: 8, paddingBottom: 8 },
  chip: { height: 32, paddingHorizontal: 14, borderRadius: 16, justifyContent: 'center' },
  product: { flexBasis: '48%', flexGrow: 1, maxWidth: '50%', borderRadius: Shape.max, padding: 8, gap: 8 },
  productImage: { height: 148, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: '88%', height: '88%' },
  off: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, height: 20, borderRadius: 4, justifyContent: 'center' },
  offText: { fontFamily: Fonts.semiBold, fontSize: 11, lineHeight: 14 },
  productText: { gap: 2, minHeight: 72 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24, fontVariant: OPEN_DIGITS },
  strike: { textDecorationLine: 'line-through' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Shape.small, height: 32 },
  stepButton: { margin: 0, width: 28, height: 28 },
  qty: { fontFamily: Fonts.semiBold, fontSize: 14, minWidth: 16, textAlign: 'center', fontVariant: OPEN_DIGITS },
});
