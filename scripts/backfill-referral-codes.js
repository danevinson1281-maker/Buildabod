import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Generate unique referral code ────────────────────────────────────────
async function generateUniqueReferralCode() {
  const adjectives = ['THOR', 'IRON', 'HULK', 'HAWK', 'BLACK', 'SPIDER', 'CAP', 'QUICK', 'WITCH', 'VISION', 'STAR', 'STORM', 'FIRE', 'STONE', 'BLADE'];
  
  let code;
  let isUnique = false;

  while (!isUnique) {
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    code = `${randomAdj}${randomNum}`;

    // Check if code already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('referral_code', code)
      .single();

    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}

// ── Main migration function ──────────────────────────────────────────────
async function backfillReferralCodes() {
  console.log('🚀 Starting referral code backfill...\n');

  try {
    // Get all clients without referral codes
    const { data: clientsWithoutCodes, error: fetchError } = await supabase
      .from('clients')
      .select('id, full_name, email, referral_code')
      .is('referral_code', null);

    if (fetchError) {
      console.error('❌ Error fetching clients:', fetchError);
      process.exit(1);
    }

    if (!clientsWithoutCodes || clientsWithoutCodes.length === 0) {
      console.log('✅ All clients already have referral codes!');
      process.exit(0);
    }

    console.log(`📊 Found ${clientsWithoutCodes.length} clients without referral codes\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each client
    for (const client of clientsWithoutCodes) {
      try {
        const newCode = await generateUniqueReferralCode();
        
        const { error: updateError } = await supabase
          .from('clients')
          .update({ referral_code: newCode })
          .eq('id', client.id);

        if (updateError) {
          console.error(`❌ Error updating ${client.full_name}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ ${client.full_name} (${client.email}) → ${newCode}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception for ${client.full_name}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Migration complete!`);
    console.log(`✅ Updated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('🔴 Fatal error:', error);
    process.exit(1);
  }
}

// Run migration
backfillReferralCodes();

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔑 Loaded credentials:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌',
});

// ── Generate unique referral code ────────────────────────────────────────
async function generateUniqueReferralCode() {
  const adjectives = ['THOR', 'IRON', 'HULK', 'HAWK', 'BLACK', 'SPIDER', 'CAP', 'QUICK', 'WITCH', 'VISION', 'STAR', 'STORM', 'FIRE', 'STONE', 'BLADE'];
  
  let code;
  let isUnique = false;

  while (!isUnique) {
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    code = `${randomAdj}${randomNum}`;

    // Check if code already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('referral_code', code)
      .single();

    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}

// ── Main migration function ──────────────────────────────────────────────
async function backfillReferralCodes() {
  console.log('🚀 Starting referral code backfill...\n');

  try {
    // Get all clients without referral codes
    const { data: clientsWithoutCodes, error: fetchError } = await supabase
      .from('clients')
      .select('id, full_name, email, referral_code')
      .is('referral_code', null);

    if (fetchError) {
      console.error('❌ Error fetching clients:', fetchError);
      process.exit(1);
    }

    if (!clientsWithoutCodes || clientsWithoutCodes.length === 0) {
      console.log('✅ All clients already have referral codes!');
      process.exit(0);
    }

    console.log(`📊 Found ${clientsWithoutCodes.length} clients without referral codes\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each client
    for (const client of clientsWithoutCodes) {
      try {
        const newCode = await generateUniqueReferralCode();
        
        const { error: updateError } = await supabase
          .from('clients')
          .update({ referral_code: newCode })
          .eq('id', client.id);

        if (updateError) {
          console.error(`❌ Error updating ${client.full_name}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ ${client.full_name} (${client.email}) → ${newCode}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception for ${client.full_name}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Migration complete!`);
    console.log(`✅ Updated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('🔴 Fatal error:', error);
    process.exit(1);
  }
}

// Run migration
backfillReferralCodes();


