import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeRichText } from './content';

test('sanitizeRichText removes scripts and preserves allowed formatting', () => {
  const output = sanitizeRichText('<p>Hello <strong>HomeHub</strong></p><script>alert(1)</script><a href="https://example.com">Link</a>');
  assert.equal(output.includes('<script>'), false);
  assert.equal(output.includes('<strong>HomeHub</strong>'), true);
  assert.equal(output.includes('rel="nofollow noopener noreferrer"'), true);
  assert.equal(output.includes('target="_blank"'), true);
});
