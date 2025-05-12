/**
 * @jest-environment jsdom
 */

import { PrintStateManager } from '../../js/print-state-manager';

describe('PrintStateManager', () => {
  let printStateManager;
  
  beforeEach(() => {
    // Create necessary DOM elements
    document.body.innerHTML = `
      <div id="terminal-output"></div>
      <button id="start-print-btn"></button>
      <button id="pause-print-btn"></button>
      <button id="resume-print-btn"></button>
      <button id="cancel-print-btn"></button>
    `;
    
    // Initialize PrintStateManager
    printStateManager = new PrintStateManager();
    
    // Mock the console methods
    global.console.log = jest.fn();
    global.console.error = jest.fn();
  });
  
  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });
  
  test('should initialize with IDLE state', () => {
    expect(printStateManager.currentState).toBe('IDLE');
    expect(printStateManager.stateHistory.length).toBe(1);
    expect(printStateManager.stateHistory[0].state).toBe('IDLE');
  });
  
  test('should transition to a valid next state', () => {
    // Transition from IDLE to ANALYZING
    printStateManager.transition('ANALYZING');
    
    // Check that the state has changed
    expect(printStateManager.currentState).toBe('ANALYZING');
    expect(printStateManager.stateHistory.length).toBe(2);
    expect(printStateManager.stateHistory[1].state).toBe('ANALYZING');
    
    // Transition from ANALYZING to PRINTING
    printStateManager.transition('PRINTING');
    
    // Check that the state has changed again
    expect(printStateManager.currentState).toBe('PRINTING');
    expect(printStateManager.stateHistory.length).toBe(3);
    expect(printStateManager.stateHistory[2].state).toBe('PRINTING');
  });
  
  test('should not transition to an invalid next state', () => {
    // Attempt to transition from IDLE to PAUSED (invalid)
    printStateManager.transition('PAUSED');
    
    // Check that the state has not changed
    expect(printStateManager.currentState).toBe('IDLE');
    expect(printStateManager.stateHistory.length).toBe(1);
    expect(console.error).toHaveBeenCalled();
  });
  
  test('should update UI based on state', () => {
    // Spy on the updateUI method
    const updateUISpy = jest.spyOn(printStateManager, 'updateUI');
    
    // Initialize, which should call updateUI
    printStateManager.init();
    
    // Check that updateUI was called
    expect(updateUISpy).toHaveBeenCalled();
    
    // Check button states
    expect(document.getElementById('start-print-btn').disabled).toBe(false);
    expect(document.getElementById('pause-print-btn').disabled).toBe(true);
    expect(document.getElementById('resume-print-btn').disabled).toBe(true);
    expect(document.getElementById('cancel-print-btn').disabled).toBe(true);
    
    // Transition to ANALYZING
    printStateManager.transition('ANALYZING');
    
    // Check button states after transition
    expect(document.getElementById('start-print-btn').disabled).toBe(true);
    expect(document.getElementById('pause-print-btn').disabled).toBe(true);
    expect(document.getElementById('resume-print-btn').disabled).toBe(true);
    expect(document.getElementById('cancel-print-btn').disabled).toBe(false);
  });
  
  test('should track performance metrics', () => {
    // Start tracking metrics
    printStateManager.startTracking('testOperation');
    
    // End tracking metrics (with mock timing)
    const mockPerformance = { now: jest.fn().mockReturnValue(1000) };
    global.performance = mockPerformance;
    
    printStateManager.endTracking('testOperation');
    
    // Check that metrics were recorded
    expect(printStateManager.performanceMetrics.testOperation).toBeDefined();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Performance:'));
  });
  
  test('should handle events through listeners', () => {
    // Spy on the transition method
    const transitionSpy = jest.spyOn(printStateManager, 'transition');
    
    // Initialize to set up event listeners
    printStateManager.init();
    
    // Trigger start button click
    document.getElementById('start-print-btn').click();
    
    // Check that transition was called with ANALYZING
    expect(transitionSpy).toHaveBeenCalledWith('ANALYZING');
    
    // Transition to PRINTING
    printStateManager.transition('PRINTING');
    
    // Trigger pause button click
    document.getElementById('pause-print-btn').click();
    
    // Check that transition was called with PAUSED
    expect(transitionSpy).toHaveBeenCalledWith('PAUSED');
  });
  
  test('should show error state with message', () => {
    // Spy on the updateUI method
    const updateUISpy = jest.spyOn(printStateManager, 'updateUI');
    
    // Transition to ERROR state with a message
    printStateManager.showError('Test error message');
    
    // Check state and UI updates
    expect(printStateManager.currentState).toBe('ERROR');
    expect(printStateManager.stateHistory[1].state).toBe('ERROR');
    expect(updateUISpy).toHaveBeenCalled();
    
    // Check that the error message is displayed
    const terminalOutput = document.getElementById('terminal-output');
    expect(terminalOutput.innerHTML).toContain('Test error message');
  });
  
  test('should reset to IDLE state', () => {
    // Transition to PRINTING
    printStateManager.transition('ANALYZING');
    printStateManager.transition('PRINTING');
    
    // Reset to IDLE
    printStateManager.reset();
    
    // Check that we're back to IDLE
    expect(printStateManager.currentState).toBe('IDLE');
    
    // State history should be preserved
    expect(printStateManager.stateHistory.length).toBe(4); // IDLE -> ANALYZING -> PRINTING -> IDLE
    
    // Check button states
    expect(document.getElementById('start-print-btn').disabled).toBe(false);
    expect(document.getElementById('pause-print-btn').disabled).toBe(true);
    expect(document.getElementById('resume-print-btn').disabled).toBe(true);
    expect(document.getElementById('cancel-print-btn').disabled).toBe(true);
  });
}); 