// /app/api/download-meal-plan-pdf/route.js
// BuildABod – Meal Plan PDF Generator
// Displays clean portions: Protein (oz), Carbs/Veggies/Fruits (g), Fats (tbsp/tsp)

import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(request) {
  console.log('PDF generation started');

  try {
    const { clientName, mealPlan } = await request.json();

    if (!clientName || !mealPlan) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    console.log('mealPlan keys:', Object.keys(mealPlan));
    console.log('meals_data type:', typeof mealPlan.meals_data);

    // ── Extract meals and substitutions ──────────────────────────────────
    let meals         = {};
    let substitutions = {};

    if (mealPlan.meals_data && typeof mealPlan.meals_data === 'object') {
      if (mealPlan.meals_data.meals && typeof mealPlan.meals_data.meals === 'object') {
        // Legacy format: { meals: {...}, substitutions: {...} }
        meals         = mealPlan.meals_data.meals;
        substitutions = mealPlan.meals_data.substitutions || mealPlan.substitutions || {};
      } else {
        // New format: meals_data is already the flat meals object
        meals         = mealPlan.meals_data;
        substitutions = mealPlan.substitutions || {};
      }
    }

    // ── Read macros — rounded for clean PDF display ───────────────────────
    const dailyCal = Math.round(mealPlan.target_calories  || 0);
    const dailyP   = Math.round(mealPlan.target_protein_g || 0);
    const dailyC   = Math.round(mealPlan.target_carbs_g   || 0);
    const dailyF   = Math.round(mealPlan.target_fats_g    || 0);

    console.log('Macros:', { dailyCal, dailyP, dailyC, dailyF });
    console.log('Meal keys found:', Object.keys(meals));
    console.log('Sub categories:', Object.keys(substitutions));

    return new Promise((resolve, reject) => {
      const chunks = [];
      const doc    = new PDFDocument({
        size:          'A4',
        margin:        0,
        autoFirstPage: false,
      });

      doc.on('data',  (chunk) => chunks.push(chunk));

      doc.on('end', () => {
        console.log('PDF end event triggered');
        const buffer = Buffer.concat(chunks);
        console.log('Total buffer size:', buffer.length);

        if (buffer.length === 0) {
          reject(new Error('Generated PDF is empty'));
          return;
        }

        resolve(
          new NextResponse(buffer, {
            status:  200,
            headers: {
              'Content-Type':        'application/pdf',
              'Content-Length':      buffer.length.toString(),
              'Content-Disposition': 'attachment; filename="' + clientName + '-meal-plan.pdf"',
              'Cache-Control':       'no-cache, no-store, must-revalidate',
            },
          })
        );
      });

      doc.on('error', (err) => {
        console.error('PDF doc error:', err);
        reject(err);
      });

      try {
        const PAGE_WIDTH    = 612;
        const PAGE_HEIGHT   = 792;
        const MARGIN        = 36;
        const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

        const GOLD        = '#FFD700';
        const BLACK       = '#111111';
        const DARK_BG     = '#1a1a1a';
        const DARKER_ROW  = '#222222';
        const LIGHTER_ROW = '#2a2a2a';
        const MID_GRAY    = '#999999';
        const OFF_WHITE   = '#eeeeee';

        const CAT_COLORS = {
          'Protein':      '#ef4444',
          'Carbs':        '#3b82f6',
          'Vegetables':   '#22c55e',
          'Healthy Fats': '#eab308',
          'Fruits':       '#a855f7',
        };

        const MEAL_COLORS = [
          '#FFD700', '#ef4444', '#3b82f6',
          '#22c55e', '#a855f7', '#f97316',
        ];

        const mealKeys = Object.keys(meals)
          .filter(k => k.startsWith('Meal'))
          .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
          });

        const mealCount = mealKeys.length;
        console.log('Meal count:', mealCount, '| Meal keys:', mealKeys);

        const drawPageAccent = () => {
          doc.rect(0, 0, 6, PAGE_HEIGHT).fill(GOLD);
          doc.rect(PAGE_WIDTH - 6, 0, 6, PAGE_HEIGHT).fill(GOLD);
          doc.rect(0, 0, PAGE_WIDTH, 2).fill(GOLD);
        };

        // ═══════════════════════════════════════════
        // PAGE 1 — COVER
        // ═══════════════════════════════════════════
        doc.addPage();
        doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(BLACK);
        drawPageAccent();

        doc.rect(0, 0, PAGE_WIDTH, 130).fill('#0a0a0a');

        doc.fontSize(52).font('Helvetica-Bold').fillColor(GOLD)
          .text('BuildABod', 0, 30, { align: 'center', width: PAGE_WIDTH });

        doc.fontSize(10).font('Helvetica').fillColor('#999999')
          .text('Custom Nutrition by Dane Vinson', 0, 88, { align: 'center', width: PAGE_WIDTH });

        doc.rect(MARGIN + 40, 108, CONTENT_WIDTH - 80, 0.5).fill(GOLD);

        // Adaptive font size for long client names
        const nameFontSize = clientName.length > 20 ? 28 : clientName.length > 14 ? 34 : 42;
        doc.fontSize(nameFontSize).font('Helvetica-Bold').fillColor(GOLD)
          .text(clientName, MARGIN, 155, { width: CONTENT_WIDTH, align: 'center' });

        doc.fontSize(9).font('Helvetica').fillColor('#666666')
          .text(
            new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            0, 205, { align: 'center', width: PAGE_WIDTH }
          );

        // Macro cards
        const cardStartY = 235;
        const cardHeight = 100;
        const cardWidth  = (CONTENT_WIDTH - 9) / 4;

        const macroCards = [
          { label: 'CALORIES', value: dailyCal, unit: 'kcal', color: GOLD       },
          { label: 'PROTEIN',  value: dailyP,   unit: 'g',    color: '#ef4444'  },
          { label: 'CARBS',    value: dailyC,   unit: 'g',    color: '#3b82f6'  },
          { label: 'FATS',     value: dailyF,   unit: 'g',    color: '#22c55e'  },
        ];

        macroCards.forEach((m, i) => {
          const cardX = MARGIN + i * (cardWidth + 3);
          doc.rect(cardX, cardStartY, cardWidth, cardHeight).fill(DARK_BG);
          doc.rect(cardX, cardStartY, cardWidth, 3).fill(m.color);
          doc.fontSize(32).font('Helvetica-Bold').fillColor(m.color)
            .text(String(m.value), cardX, cardStartY + 28, { width: cardWidth, align: 'center' });
          doc.fontSize(7).font('Helvetica-Bold').fillColor('#666666')
            .text(m.label, cardX, cardStartY + 66, { width: cardWidth, align: 'center' });
          doc.fontSize(8).font('Helvetica').fillColor('#888888')
            .text(m.unit, cardX, cardStartY + 76, { width: cardWidth, align: 'center' });
        });

        // What's inside box
        doc.rect(MARGIN, 350, CONTENT_WIDTH, 85).fill(DARK_BG);
        doc.rect(MARGIN, 350, CONTENT_WIDTH, 2.5).fill(GOLD);

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#888888')
          .text("WHAT'S INSIDE YOUR PLAN", MARGIN + 12, 360, { width: CONTENT_WIDTH - 24, align: 'center' });

        const infoItems = [
          mealCount + ' Meals Per Day - fully portioned and macro-balanced',
          'Exact measurements for every food item',
          'Food substitutions (swap anything without losing macros)',
        ];

        infoItems.forEach((item, i) => {
          doc.fontSize(9).font('Helvetica-Bold').fillColor(GOLD)
            .text('✓ ', MARGIN + 12, 379 + i * 14, { continued: true });
          doc.font('Helvetica').fillColor('#cccccc')
            .text(item, { width: CONTENT_WIDTH - 30 });
        });

        // Quote box
        doc.rect(MARGIN, 450, CONTENT_WIDTH, 90).fill('#0a0a0a');
        doc.rect(MARGIN, 450, 3, 90).fill(GOLD);

        doc.fontSize(13).font('Helvetica-Bold').fillColor('#ffffff')
          .text('"Your body achieves what', MARGIN + 12, 465, { width: CONTENT_WIDTH - 24 });
        doc.fontSize(13).font('Helvetica-Bold').fillColor(GOLD)
          .text('your mind believes."', MARGIN + 12, 482, { width: CONTENT_WIDTH - 24 });
        doc.fontSize(9).font('Helvetica').fillColor(GOLD)
          .text('— Dane Vinson', MARGIN + 12, 510);
        doc.fontSize(8).font('Helvetica').fillColor('#777777')
          .text('Hit these macros daily and watch your transformation.', MARGIN + 12, 525, { width: CONTENT_WIDTH - 24 });

        // ═══════════════════════════════════════════
        // PAGE 2 — MEALS
        // ═══════════════════════════════════════════
        console.log('Drawing meals page...');
        doc.addPage();
        doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(BLACK);
        drawPageAccent();

        doc.rect(MARGIN, 15, CONTENT_WIDTH, 30).fill(DARK_BG);
        doc.rect(MARGIN, 15, 4, 30).fill(GOLD);
        doc.fontSize(18).font('Helvetica-Bold').fillColor(GOLD)
          .text('Your Meal Plan', MARGIN + 12, 22);

        let currentY = 55;

        if (mealKeys.length === 0) {
          doc.fontSize(12).font('Helvetica').fillColor('#999999')
            .text('No meals found in this plan.', MARGIN, currentY);
        }

        mealKeys.forEach((mealName, mealIdx) => {
          const meal = meals[mealName];

          if (!meal) {
            console.warn('Meal ' + mealName + ' is empty');
            return;
          }

          const foods         = meal.foods  || [];
          const totals        = meal.totals || {};
          const mealColor     = MEAL_COLORS[mealIdx % MEAL_COLORS.length];
          const foodRowHeight = 14;
          const mealHeaderH   = 18;
          const totalsRowH    = 14;
          const requiredSpace = mealHeaderH + (foods.length * foodRowHeight) + totalsRowH + 4;

          if (currentY + requiredSpace > PAGE_HEIGHT - 40) {
            doc.addPage();
            doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(BLACK);
            drawPageAccent();
            currentY = 25;
          }

          // Meal header
          doc.rect(MARGIN, currentY, CONTENT_WIDTH, mealHeaderH).fill(DARKER_ROW);
          doc.rect(MARGIN, currentY, 4, mealHeaderH).fill(mealColor);
          doc.circle(MARGIN + 18, currentY + mealHeaderH / 2, 6.5).fill(mealColor);
          doc.fontSize(10).font('Helvetica-Bold').fillColor(BLACK)
            .text(String(mealIdx + 1), MARGIN + 14, currentY + 3, { width: 8, align: 'center' });
          doc.fontSize(11).font('Helvetica-Bold').fillColor(mealColor)
            .text(mealName, MARGIN + 32, currentY + 2);
          currentY += mealHeaderH;

          // Foods — with clean portions
          foods.forEach((food, foodIdx) => {
            const rowBg = foodIdx % 2 === 0 ? DARKER_ROW : LIGHTER_ROW;
            doc.rect(MARGIN, currentY, CONTENT_WIDTH, foodRowHeight).fill(rowBg);
            doc.rect(MARGIN, currentY, 3, foodRowHeight).fill(CAT_COLORS[food.category] || '#666666');

            doc.fontSize(8).font('Helvetica-Bold').fillColor(OFF_WHITE)
              .text(food.name || '', MARGIN + 8, currentY + 1, { width: 180 });
            
            // ✅ Display clean portion (no formatting needed - already clean from generator)
            doc.fontSize(8).font('Helvetica-Bold').fillColor(GOLD)
              .text(food.portion || '', MARGIN + 200, currentY + 1, { width: 120 });
            
            doc.fontSize(6.5).font('Helvetica').fillColor(MID_GRAY)
              .text(
                Math.round(food.calories  || 0) + 'cal  ' +
                'P:' + Math.round(food.protein_g || 0) + 'g  ' +
                'C:' + Math.round(food.carbs_g   || 0) + 'g  ' +
                'F:' + Math.round(food.fats_g    || 0) + 'g',
                MARGIN + 330, currentY + 1
              );
            currentY += foodRowHeight;
          });

          // Meal totals row
          doc.rect(MARGIN, currentY, CONTENT_WIDTH, totalsRowH).fill('#0a0a0a');
          doc.rect(MARGIN, currentY, 4, totalsRowH).fill(mealColor);
          doc.fontSize(7).font('Helvetica-Bold').fillColor(mealColor)
            .text('TOTAL', MARGIN + 8, currentY + 1);
          doc.fontSize(7).font('Helvetica').fillColor('#cccccc')
            .text(
              Math.round(totals.calories  || 0) + ' cal  |  ' +
              'P:' + Math.round(totals.protein_g || 0) + 'g  |  ' +
              'C:' + Math.round(totals.carbs_g   || 0) + 'g  |  ' +
              'F:' + Math.round(totals.fats_g    || 0) + 'g',
              MARGIN + 50, currentY + 1
            );
          currentY += totalsRowH + 4;
        });

        // ═══════════════════════════════════════════
        // PAGE 3 — SUBSTITUTIONS
        // ═══════════════════════════════════════════
        const hasSubs = substitutions &&
          Object.keys(substitutions).length > 0 &&
          Object.values(substitutions).some(arr => Array.isArray(arr) && arr.length > 0);

        if (hasSubs) {
          console.log('Drawing substitutions page...');
          doc.addPage();
          doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(BLACK);
          drawPageAccent();

          doc.rect(MARGIN, 15, CONTENT_WIDTH, 30).fill(DARK_BG);
          doc.rect(MARGIN, 15, 4, 30).fill(GOLD);
          doc.fontSize(18).font('Helvetica-Bold').fillColor(GOLD)
            .text('Food Substitutions', MARGIN + 12, 22);

          doc.fontSize(8).font('Helvetica').fillColor('#888888')
            .text(
              'Swap any food below with another from the same category. Each portion is pre-calculated to match your macros perfectly.',
              MARGIN, 55, { width: CONTENT_WIDTH }
            );

          currentY = 75;

          const subCategories = [
            { key: 'proteins',   label: 'Protein Swaps',   color: '#ef4444' },
            { key: 'carbs',      label: 'Carb Swaps',      color: '#3b82f6' },
            { key: 'fats',       label: 'Fat Swaps',       color: '#eab308' },
            { key: 'vegetables', label: 'Vegetable Swaps', color: '#22c55e' },
            { key: 'fruits',     label: 'Fruit Options',   color: '#a855f7' },
          ];

          subCategories.forEach(({ key, label, color }) => {
            const items = substitutions[key] || [];
            if (!Array.isArray(items) || items.length === 0) return;

            const itemsHeight = items.length * 15 + 20;
            if (currentY + itemsHeight > PAGE_HEIGHT - 40) {
              doc.addPage();
              doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(BLACK);
              drawPageAccent();
              currentY = 25;
            }

            // Category header
            doc.rect(MARGIN, currentY, CONTENT_WIDTH, 18).fill(color);
            doc.fontSize(9).font('Helvetica-Bold').fillColor(BLACK)
              .text(label, MARGIN + 10, currentY + 3);
            currentY += 20;

            items.forEach((item, idx) => {
              const itemBg = idx % 2 === 0 ? DARKER_ROW : LIGHTER_ROW;
              doc.rect(MARGIN, currentY, CONTENT_WIDTH, 15).fill(itemBg);
              doc.rect(MARGIN, currentY, 3, 15).fill(color);

              doc.fontSize(8).font('Helvetica-Bold').fillColor(OFF_WHITE)
                .text(item.name || '', MARGIN + 8, currentY + 1, { width: 200 });
              
              // ✅ Display clean portion (already clean from generator)
              doc.fontSize(8).font('Helvetica-Bold').fillColor(GOLD)
                .text(item.portion || '', MARGIN + 220, currentY + 1, { width: 120 });
              
              doc.fontSize(6.5).font('Helvetica').fillColor(MID_GRAY)
                .text(
                  Math.round(item.calories  || 0) + 'cal  ' +
                  'P:' + Math.round(item.protein_g || 0) + 'g  ' +
                  'C:' + Math.round(item.carbs_g   || 0) + 'g  ' +
                  'F:' + Math.round(item.fats_g    || 0) + 'g',
                  MARGIN + 350, currentY + 1
                );
              currentY += 15;
            });

            currentY += 5;
          });
        }

        // ── Footer on last page ───────────────────────────────────────────
        doc.fontSize(7).font('Helvetica').fillColor('#333333')
          .text(
`BuildABod © 2026–${new Date().getFullYear()}| Personalized Nutrition by Dane Vinson`,
            0, PAGE_HEIGHT - 15, { align: 'center', width: PAGE_WIDTH }
          );

        console.log('All pages drawn, calling doc.end()...');
        doc.end();

      } catch (err) {
        console.error('Error during PDF drawing:', err);
        reject(err);
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
