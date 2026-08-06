// Pure calculation logic for the revenue calculator — ported 1:1 from the
// standalone strrevenue.netlify.app tool so results stay identical to the
// version already linked from the /landlords page.

export type CalculatorInputs = {
  occupancy: number;
  adr: number;
  currentRevenue: number;
  platformCount: number;
  hoursPerWeek: number;
};

export type CalculatorResult = {
  targetOccupancy: number;
  occGain: number;
  rateGain: number;
  channelGain: number;
  gross: number;
  commission: number;
  net: number;
  uplift: number;
  upliftPercent: number;
  hoursSaved: number;
};

const COMMISSION_RATE = 0.2;

export function calculateRevenue({
  occupancy,
  adr,
  currentRevenue,
  platformCount,
  hoursPerWeek,
}: CalculatorInputs): CalculatorResult {
  const targetOccupancy = Math.min(
    78,
    occupancy + (occupancy < 45 ? 28 : occupancy < 60 ? 16 : occupancy < 70 ? 8 : 3)
  );
  const occUpliftRatio = (targetOccupancy - occupancy) / occupancy;
  const occGain = currentRevenue * occUpliftRatio;

  const rateUpliftRatio = adr < 80 ? 0.18 : adr < 150 ? 0.15 : adr < 250 ? 0.12 : 0.08;
  const rateGain = (currentRevenue + occGain) * rateUpliftRatio;

  const channelUpliftRatio = platformCount <= 1 ? 0.13 : platformCount === 2 ? 0.07 : 0.03;
  const channelGain = (currentRevenue + occGain + rateGain) * channelUpliftRatio;

  const gross = currentRevenue + occGain + rateGain + channelGain;
  const commission = gross * COMMISSION_RATE;
  const net = gross - commission;
  const uplift = net - currentRevenue;
  const upliftPercent = currentRevenue > 0 ? Math.round((uplift / currentRevenue) * 100) : 0;

  return {
    targetOccupancy,
    occGain,
    rateGain,
    channelGain,
    gross,
    commission,
    net,
    uplift,
    upliftPercent,
    hoursSaved: Math.max(0, hoursPerWeek - 1),
  };
}

export function formatEuro(n: number): string {
  return "€" + Math.round(n).toLocaleString("en-IE");
}
