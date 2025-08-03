// Mock for isows module to fix Jest ES module issues
module.exports = {
  WebSocket: jest.fn().mockImplementation(() => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1,
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  })),
  getNativeWebSocket: jest.fn().mockReturnValue(global.WebSocket || jest.fn())
}; 