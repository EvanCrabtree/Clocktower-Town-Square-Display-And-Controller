import { test, expect } from '@playwright/test';

/**
 * Generate mock players for testing
 */
function generatePlayers(count: number) {
  const players = [];
  for (let i = 0; i < count; i++) {
    players.push({
      name: `Player ${i + 1}`,
      alive: i % 3 !== 0, // Every 3rd player is dead
      traveler: i >= count - 2 && count > 5, // Last 2 are travelers if enough players
      ghostVote: i % 3 !== 0 && i % 2 === 0, // Some dead players have ghost votes
    });
  }
  return players;
}

/**
 * Setup mock WebSocket using page.routeWebSocket
 */
async function setupMockWebSocket(page: any, playerCount: number, phase: string = 'Night', phaseNumber: number = 1) {
  const data = { 
    players: generatePlayers(playerCount), 
    phase, 
    phaseNumber 
  };
  
  await page.routeWebSocket(/ws:\/\/.*/, (ws) => {
    ws.onMessage(() => {});
    ws.send(JSON.stringify(data));
  });
}

/**
 * Test display rendering for player counts 6-20
 */
for (let playerCount = 6; playerCount <= 20; playerCount++) {
  test(`Display renders correctly with ${playerCount} players`, async ({ page }) => {
    // Setup mock before navigation
    await setupMockWebSocket(page, playerCount, 'Night', 1);
    
    // Navigate to display page
    await page.goto('display.html');
    
    // Wait for mock data to be processed
    await page.waitForTimeout(200);
    
    // Verify the phase display updated
    const phaseDisplay = page.locator('#phaseDisplay');
    await expect(phaseDisplay).toContainText('Night 1');
    
    // Verify player stats are correct
    const totalPlayers = page.locator('#totalPlayers');
    await expect(totalPlayers).toHaveText(playerCount.toString());
    
    // Verify all player cards are rendered
    const playerCards = page.locator('.player-card');
    await expect(playerCards).toHaveCount(playerCount);
    
    // Verify player names are visible
    const firstPlayer = playerCards.first();
    await expect(firstPlayer.locator('.player-name')).toContainText('Player 1');
    
    const lastPlayer = playerCards.last();
    await expect(lastPlayer.locator('.player-name')).toContainText(`Player ${playerCount}`);
    
    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: `test-results/player-count-${playerCount}-players.png`,
      fullPage: false 
    });
  });
  
  // Also test in Day phase
  test(`Display renders correctly with ${playerCount} players in Day phase`, async ({ page }) => {
    await setupMockWebSocket(page, playerCount, 'Day', 2);
    
    await page.goto('display.html');
    await page.waitForTimeout(200);
    
    // Verify day theme is applied (body has day-theme class)
    const body = page.locator('body');
    await expect(body).toHaveClass(/day-theme/);
    
    // Verify phase display shows Day 2
    const phaseDisplay = page.locator('#phaseDisplay');
    await expect(phaseDisplay).toContainText('Day 2');
    
    // Verify player count
    const playerCards = page.locator('.player-card');
    await expect(playerCards).toHaveCount(playerCount);
    
    // Take screenshot
    await page.screenshot({ 
      path: `test-results/player-count-${playerCount}-players-day.png`,
      fullPage: false 
    });
  });
}

/**
 * Test edge case: 6 players all alive, no travelers
 */
test('6 players - all alive, no travelers', async ({ page }) => {
  const data = {
    players: Array.from({ length: 6 }, (_, i) => ({
      name: `Player ${i + 1}`,
      alive: true,
      traveler: false,
      ghostVote: false,
    })),
    phase: 'Night',
    phaseNumber: 1,
  };
  
  await page.routeWebSocket(/ws:\/\/.*/, (ws) => {
    ws.onMessage(() => {});
    ws.send(JSON.stringify(data));
  });
  
  await page.goto('display.html');
  await page.waitForTimeout(200);
  
  // All players should be alive
  await expect(page.locator('#alivePlayers')).toHaveText('6');
  await expect(page.locator('#deadPlayers')).toHaveText('0');
  
  // No traveler icons
  const travelerIcons = page.locator('.status-icon');
  const count = await travelerIcons.count();
  let travelerCount = 0;
  for (let i = 0; i < count; i++) {
    const text = await travelerIcons.nth(i).textContent();
    if (text?.includes('🎒')) travelerCount++;
  }
  expect(travelerCount).toBe(0);
  
  await page.screenshot({ path: 'test-results/player-count-6-all-alive.png' });
});

/**
 * Test edge case: 20 players with mixed states
 */
test('20 players - mixed states', async ({ page }) => {
  const data = {
    players: Array.from({ length: 20 }, (_, i) => ({
      name: `Player ${i + 1}`,
      alive: i < 12, // 12 alive, 8 dead
      traveler: i >= 15, // 5 travelers (players 16-20)
      ghostVote: i >= 12 && i < 16, // 4 ghost votes
    })),
    phase: 'Day',
    phaseNumber: 3,
  };
  
  await page.routeWebSocket(/ws:\/\/.*/, (ws) => {
    ws.onMessage(() => {});
    ws.send(JSON.stringify(data));
  });
  
  await page.goto('display.html');
  await page.waitForTimeout(200);
  
  // Verify counts
  await expect(page.locator('#alivePlayers')).toHaveText('12');
  await expect(page.locator('#deadPlayers')).toHaveText('8');
  
  // Count traveler icons (🎒) only in player cards (not legend)
  const playerCards = page.locator('.player-card');
  const playerContent = await playerCards.evaluateAll(cards => cards.map(c => c.textContent).join(''));
  const travelerMatches = playerContent.match(/🎒/g);
  expect(travelerMatches?.length || 0).toBe(5);
  
  // Count ghost vote icons (👻) only in player cards
  const ghostMatches = playerContent.match(/👻/g);
  expect(ghostMatches?.length || 0).toBe(4);
  
  await page.screenshot({ path: 'test-results/player-count-20-mixed.png' });
});
