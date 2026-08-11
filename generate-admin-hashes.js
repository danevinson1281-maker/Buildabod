import bcrypt from 'bcryptjs'

async function generateHashes() {
  const newPassword = 'AvDvAvZv1010'

  const hash = await bcrypt.hash(newPassword, 10)

  console.log('\n=== BCRYPT HASH ===\n')
  console.log('Hash:')
  console.log(hash)
  console.log('\n=== END HASH ===\n')
}

generateHashes()
