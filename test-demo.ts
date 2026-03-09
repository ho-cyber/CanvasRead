import { chromium } from 'playwright';

async function test() {
    console.log('Testing with ANGLE metal...');
    const browser = await chromium.launch({ 
        headless: true,
        args: [
            "--use-gl=angle", 
            "--use-angle=metal"
        ]
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    page.on('console', msg => { if(msg.text().includes('WebGL')) console.log('PAGE LOG:', msg.text()) });
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle', timeout: 5000 });
    
    const canvas = await page.$('canvas');
    if (canvas) console.log('✅ Canvas found!');
    else console.log('❌ Canvas NOT found!');
    await browser.close();
}

test().catch(console.error);
