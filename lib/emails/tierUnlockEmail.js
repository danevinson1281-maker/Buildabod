export const tierUnlockEmail = (clientName, tier) => {
  const tierEmoji = {
    COMMITTED: '🔥',
    DEDICATED: '💪',
    'BUILT FOR LIFE': '🏆'
  };

  const tierMessage = {
    COMMITTED: "You showed up. You stuck with it. That puts you ahead of 90% of people who say they want to change. Keep going — this is just the beginning.",
    DEDICATED: "5 months in. Most people quit after 1. You didn't. Your consistency is why this works — and the best results are still ahead of you.",
    'BUILT FOR LIFE': "10 months. You're not just following a plan anymore — you've built a lifestyle. You're officially BUILT FOR LIFE. This is the highest tier, and you earned every bit of it."
  };

  const paymentNum = {
    COMMITTED: '2nd',
    DEDICATED: '5th',
    'BUILT FOR LIFE': '10th'
  };

  const nextMilestone = {
    COMMITTED: "Next milestone: DEDICATED (3 more payments). Keep showing up.",
    DEDICATED: "Next milestone: BUILT FOR LIFE (5 more payments). You're closer than you think.",
    'BUILT FOR LIFE': null
  };

  const firstName = clientName?.split(' ')[0] || 'friend';

  return {
    subject: `🎉 You've hit ${tier} status, ${firstName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto;">
          
          <h1 style="text-align: center; font-size: 32px; margin-bottom: 20px;">
            ${tierEmoji[tier]} You've hit ${tier} status!
          </h1>

          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">
            Hey ${firstName},
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">
            You just made your ${paymentNum[tier]} payment — and that means something.
          </p>

          <div style="background: #1a1a1a; border: 2px solid #fbbf24; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
            <p style="font-size: 14px; color: #999; margin: 0; text-transform: uppercase;">Your Status</p>
            <p style="font-size: 28px; font-weight: bold; color: #fbbf24; margin: 10px 0;">${tierEmoji[tier]} ${tier}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.6; color: #ccc;">
            ${tierMessage[tier]}
          </p>

          ${nextMilestone[tier] ? `
            <p style="font-size: 14px; line-height: 1.6; color: #999; margin-top: 20px;">
              ${nextMilestone[tier]}
            </p>
          ` : ''}

          <p style="font-size: 16px; line-height: 1.6; color: #ccc; margin-top: 30px;">
            Proud of you. Let's keep building.
          </p>

          <p style="font-size: 16px; color: #fbbf24; font-weight: bold; margin-top: 30px;">
            — Dane
          </p>

        </div>
      </div>
    `
  };
};
