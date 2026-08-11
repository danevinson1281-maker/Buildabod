import PDFDocument from 'pdfkit'

function capitalizeName(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export async function generateMealPlanPDF(client, mealPlan) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 18, size: 'A4' })
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // === PARSE MEAL DATA ===
    let mealsData = {}
    let substitutions = {}

    if (mealPlan.meals_data) {
      if (mealPlan.meals_data.meals) {
        mealsData = mealPlan.meals_data.meals
        substitutions = mealPlan.meals_data.substitutions || {}
      } else {
        mealsData = mealPlan.meals_data
      }
    } else if (mealPlan.meals) {
      mealsData = mealPlan.meals
      substitutions = mealPlan.substitutions || {}
    }

    // === CALCULATE DAILY TOTALS FROM ACTUAL FOODS ===
    let dailyCal = 0, dailyP = 0, dailyC = 0, dailyF = 0
    const mealOrder = ['Meal 1', 'Meal 2', 'Meal 3', 'Meal 4', 'Meal 5', 'Meal 6']
    const mealColors = ['#D4AF37', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#E67E22']
    const activeMeals = []

    mealOrder.forEach((key, idx) => {
      const meal = mealsData[key]
      if (meal && meal.foods && meal.foods.length > 0) {
        let mealCal = 0, mealP = 0, mealC = 0, mealF = 0
        meal.foods.forEach(food => {
          mealCal += food.calories || 0
          mealP += food.protein_g || 0
          mealC += food.carbs_g || 0
          mealF += food.fats_g || 0
        })

        const totals = {
          calories: Math.round(mealCal),
          protein_g: Math.round(mealP),
          carbs_g: Math.round(mealC),
          fats_g: Math.round(mealF),
        }

        activeMeals.push({ key, meal, totals, idx })
        dailyCal += totals.calories
        dailyP += totals.protein_g
        dailyC += totals.carbs_g
        dailyF += totals.fats_g
      }
    })

    dailyCal = Math.round(dailyCal)
    dailyP = Math.round(dailyP)
    dailyC = Math.round(dailyC)
    dailyF = Math.round(dailyF)

    const mealCount = activeMeals.length
    const clientName = capitalizeName(client.full_name || client.clientName || 'Client')

    // =============================================
    // PAGE 1: COVER
    // =============================================
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1A1A1A')

    doc.fillColor('#D4AF37').fontSize(38).font('Helvetica-Bold')
    doc.text('BUILDABOD', 0, 100, { align: 'center' })

    doc.moveDown(0.2)
    doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica')
    doc.text('Your Custom Meal Plan', { align: 'center' })

    doc.moveDown(2)
    doc.fillColor('#D4AF37').fontSize(22).font('Helvetica-Bold')
    doc.text(clientName, { align: 'center' })

    // Daily targets box
    doc.moveDown(1.5)
    const boxW = 440
    const boxX = (doc.page.width - boxW) / 2
    const boxY = doc.y

    doc.roundedRect(boxX, boxY, boxW, 100, 8).fill('#2A2A2A')
    doc.roundedRect(boxX, boxY, boxW, 100, 8).stroke('#D4AF37')

    doc.fillColor('#D4AF37').fontSize(11).font('Helvetica-Bold')
    doc.text('YOUR DAILY NUTRITION', boxX, boxY + 10, { width: boxW, align: 'center' })

    const colW = boxW / 4
    const numY = boxY + 32
    const labelY = boxY + 58

    const coverTargets = [
      { val: `${dailyCal}`, label: 'CALORIES' },
      { val: `${dailyP}g`, label: 'PROTEIN' },
      { val: `${dailyC}g`, label: 'CARBS' },
      { val: `${dailyF}g`, label: 'FATS' },
    ]

    coverTargets.forEach((t, i) => {
      const x = boxX + (colW * i)
      doc.fillColor('#FFFFFF').fontSize(26).font('Helvetica-Bold')
      doc.text(t.val, x, numY, { width: colW, align: 'center' })
      doc.fillColor('#888888').fontSize(8).font('Helvetica')
      doc.text(t.label, x, labelY, { width: colW, align: 'center' })
    })

    // What's inside
    doc.moveDown(8)
    doc.fillColor('#FFFFFF').fontSize(13).font('Helvetica-Bold')
    doc.text("What's Inside:", { align: 'center' })
    doc.moveDown(0.5)
    doc.fillColor('#CCCCCC').fontSize(11).font('Helvetica')
    doc.text(`• ${mealCount} perfectly balanced meals`, { align: 'center' })
    doc.text('• Customized to your goals and preferences', { align: 'center' })
    doc.text('• Easy swaps and substitutions included', { align: 'center' })

    // Quote
    doc.moveDown(3)
    const quotes = [
      '"The greatest wealth is health." — Virgil',
      '"Take care of your body. It\'s the only place you have to live." — Jim Rohn',
      '"Fitness is not about being better than someone else. It\'s about being better than you used to be."',
      '"Your body can stand almost anything. It\'s your mind you need to convince."',
      '"Success is the sum of small efforts repeated day in and day out." — Robert Collier',
    ]
    doc.fillColor('#D4AF37').fontSize(10).font('Helvetica-Oblique')
    doc.text(quotes[Math.floor(Math.random() * quotes.length)], 60, doc.y, {
      align: 'center',
      width: doc.page.width - 120,
    })

    doc.moveDown(2)
    doc.fillColor('#666666').fontSize(9).font('Helvetica')
    doc.text('Prepared by Dane Vinson — BuildABod.co', { align: 'center' })

    // Footer for page 1
    doc.fillColor('#444444').fontSize(7).font('Helvetica')
    doc.text(`BuildABod.co  |  Custom Diet Plans by Dane Vinson  |  Page 1`, 18, 832, {
      width: doc.page.width - 36,
      align: 'center',
    })

    // =============================================
    // PAGE 2: MEAL PLAN
    // =============================================
    doc.addPage()
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1A1A1A')

    doc.fillColor('#D4AF37').fontSize(13).font('Helvetica-Bold')
    doc.text('YOUR MEAL PLAN', 0, 15, { align: 'center' })

    // Daily summary bar
    const barY = 32
    doc.roundedRect(18, barY, doc.page.width - 36, 15, 3).fill('#2A2A2A')
    doc.fillColor('#AAAAAA').fontSize(6).font('Helvetica-Bold')
    doc.text(`DAILY:  ${dailyCal} cal  |  ${dailyP}g P  |  ${dailyC}g C  |  ${dailyF}g F`, 28, barY + 4, {
      width: doc.page.width - 56,
      align: 'center',
    })

    // === CALCULATE SIZES TO FORCE FIT ON ONE PAGE ===
    const mealsStartY = barY + 20
    const pageBottom = 835

    let totalFoodRows = 0
    activeMeals.forEach(m => { totalFoodRows += m.meal.foods.length })

    const fixedPerMeal = 35
    const totalFixed = activeMeals.length * fixedPerMeal
    const availableForRows = pageBottom - mealsStartY - totalFixed
    let rowH = Math.floor(availableForRows / totalFoodRows)
    rowH = Math.max(11, rowH)

    // Column positions
    const badgeX = 20
    const nameX = 85
    const portionX = 210
    const calX = 358
    const pX = 395
    const cX = 427
    const fX = 459

    let curY = mealsStartY

    activeMeals.forEach((m) => {
      const { key, meal, totals } = m
      const color = mealColors[m.idx]
      const num = m.idx + 1

      // Meal header
      doc.fillColor(color).circle(31, curY + 5, 5.5).fill()
      doc.fillColor('#FFFFFF').fontSize(5.5).font('Helvetica-Bold')
      doc.text(`${num}`, 29, curY + 2, { width: 5 })
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
      doc.text(key, 44, curY)
      curY += 14

      // Column headers
      doc.fillColor('#666666').fontSize(5).font('Helvetica-Bold')
      doc.text('CAT', badgeX, curY)
      doc.text('FOOD', nameX, curY)
      doc.text('PORTION', portionX, curY)
      doc.text('CAL', calX, curY, { width: 28, align: 'right' })
      doc.text('P', pX, curY, { width: 22, align: 'right' })
      doc.text('C', cX, curY, { width: 22, align: 'right' })
      doc.text('F', fX, curY, { width: 22, align: 'right' })
      curY += 8

      // Food rows
      meal.foods.forEach((food) => {
        const badgeH = rowH - 1
        doc.fillColor('#333333').rect(badgeX, curY, 58, badgeH).fill()
        doc.fillColor('#D4AF37').fontSize(4).font('Helvetica-Bold')
        doc.text((food.category || '').substring(0, 4).toUpperCase(), badgeX + 1, curY + Math.floor((badgeH - 4) / 2), { width: 56, align: 'center' })

        const textY = curY + Math.floor((rowH - 6) / 2)
        doc.fillColor('#FFFFFF').fontSize(6).font('Helvetica')
        doc.text(food.name, nameX, textY, { width: 120 })
        doc.text(food.portion, portionX, textY, { width: 135 })

        doc.fillColor('#CCCCCC').fontSize(6)
        doc.text(`${food.calories}`, calX, textY, { width: 28, align: 'right' })
        doc.text(`${food.protein_g}`, pX, textY, { width: 22, align: 'right' })
        doc.text(`${food.carbs_g}`, cX, textY, { width: 22, align: 'right' })
        doc.text(`${food.fats_g}`, fX, textY, { width: 22, align: 'right' })

        curY += rowH
      })

      // Meal totals row
      doc.fillColor('#2A2A2A').rect(badgeX, curY, 458, 11).fill()
      doc.fillColor('#D4AF37').fontSize(5.5).font('Helvetica-Bold')
      doc.text('TOTAL', badgeX + 3, curY + 2)
      doc.fillColor('#FFFFFF').fontSize(6).font('Helvetica-Bold')
      doc.text(`${totals.calories}`, calX, curY + 2, { width: 28, align: 'right' })
      doc.text(`${totals.protein_g}`, pX, curY + 2, { width: 22, align: 'right' })
      doc.text(`${totals.carbs_g}`, cX, curY + 2, { width: 22, align: 'right' })
      doc.text(`${totals.fats_g}`, fX, curY + 2, { width: 22, align: 'right' })

      curY += 13
    })

    // Footer for page 2
    doc.fillColor('#444444').fontSize(7).font('Helvetica')
    doc.text(`BuildABod.co  |  Custom Diet Plans by Dane Vinson  |  Page 2`, 18, 832, {
      width: doc.page.width - 36,
      align: 'center',
    })

    // =============================================
    // SUBSTITUTIONS PAGES
    // =============================================
    let pageNum = 3
    let subY = null
    let currentPageStarted = false

    const catConfig = [
      { key: 'proteins', label: 'PROTEIN SWAPS', color: '#fca5a5' },
      { key: 'carbs', label: 'CARB SWAPS', color: '#93c5fd' },
      { key: 'fats', label: 'HEALTHY FAT SWAPS', color: '#fde047' },
      { key: 'vegetables', label: 'VEGETABLE SWAPS', color: '#86efac' },
      { key: 'fruits', label: 'FRUIT SWAPS', color: '#c4b5fd' },
    ]

    catConfig.forEach(cat => {
      const foods = substitutions[cat.key] || []
      if (foods.length === 0) return

      const neededHeight = 22 + Math.ceil(foods.length / 2) * 16

      // Check if we need a new page
      if (!currentPageStarted || subY + neededHeight > 815) {
        if (currentPageStarted) {
          // Add footer to previous page
          doc.fillColor('#444444').fontSize(7).font('Helvetica')
          doc.text(`BuildABod.co  |  Custom Diet Plans by Dane Vinson  |  Page ${pageNum - 1}`, 18, 832, {
            width: doc.page.width - 36,
            align: 'center',
          })
          pageNum++
        }

        // Add new page
        doc.addPage()
        doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1A1A1A')
        subY = 25
        currentPageStarted = true
      }

      doc.fillColor(cat.color).fontSize(10).font('Helvetica-Bold')
      doc.text(cat.label, 35, subY)
      subY += 16

      const col1X = 45
      const col2X = 295

      foods.forEach((food, idx) => {
        if (idx % 2 === 0) {
          doc.fillColor('#CCCCCC').fontSize(8).font('Helvetica')
          doc.text(`• ${food.name} — ${food.portion}`, col1X, subY, { width: 235 })

          if (idx + 1 < foods.length) {
            const next = foods[idx + 1]
            doc.text(`• ${next.name} — ${next.portion}`, col2X, subY, { width: 235 })
          }
          subY += 16
        }
      })

      subY += 8
    })

    // Add footer to last substitution page if it was created
    if (currentPageStarted) {
      doc.fillColor('#444444').fontSize(7).font('Helvetica')
      doc.text(`BuildABod.co  |  Custom Diet Plans by Dane Vinson  |  Page ${pageNum}`, 18, 832, {
        width: doc.page.width - 36,
        align: 'center',
      })
    }

    doc.end()
  })
}
