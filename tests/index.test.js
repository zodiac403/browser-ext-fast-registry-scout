import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const html = readFileSync(resolve(import.meta.dirname, '../src/index.html'), 'utf8');

beforeEach(async () => {
  document.body.innerHTML = html.match(/<body[^>]*>(?<body>[\s\S]*)<\/body>/iu).groups.body;
  window.open = vi.fn();
  vi.resetModules();
  await import('../src/index.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('empty input validation', () => {
  it('empty string → error message shown, window.open not called', () => {
    document.getElementById('package').value = '';
    document.getElementById('npm').click();
    const message = document.getElementById('message');
    expect(message.innerText).toBe('Please enter a package name.');
    expect(message.style.display).toBe('block');
    expect(window.open).not.toHaveBeenCalled();
  });

  it('whitespace-only string → error message shown, window.open not called', () => {
    document.getElementById('package').value = '   ';
    document.getElementById('npm').click();
    const message = document.getElementById('message');
    expect(message.innerText).toBe('Please enter a package name.');
    expect(message.style.display).toBe('block');
    expect(window.open).not.toHaveBeenCalled();
  });
});

describe('URL construction per registry', () => {
  it('npm + react → package URL on 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200 });
    document.getElementById('package').value = 'react';
    document.getElementById('npm').click();
    await Promise.resolve();
    expect(window.open).toHaveBeenCalledWith('https://www.npmjs.com/package/react', '_blank', 'noopener,noreferrer');
  });

  it('npm + react → search URL on 404', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 404 });
    document.getElementById('package').value = 'react';
    document.getElementById('npm').click();
    await Promise.resolve();
    expect(window.open).toHaveBeenCalledWith('https://www.npmjs.com/search?q=react', '_blank', 'noopener,noreferrer');
  });

  it('pypi + requests → package URL on 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({ status: 200 });
    document.getElementById('package').value = 'requests';
    document.getElementById('pypi').click();
    await Promise.resolve();
    expect(window.open).toHaveBeenCalledWith('https://pypi.org/project/requests', '_blank', 'noopener,noreferrer');
  });

  it('docker + nginx → search URL (search-only registry)', async () => {
    document.getElementById('package').value = 'nginx';
    document.getElementById('docker').click();
    await Promise.resolve();
    expect(window.open).toHaveBeenCalledWith('https://hub.docker.com/search?q=nginx', '_blank', 'noopener,noreferrer');
  });

  it('fetch error → search URL', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    document.getElementById('package').value = 'axios';
    document.getElementById('npm').click();
    await Promise.resolve();
    expect(window.open).toHaveBeenCalledWith('https://www.npmjs.com/search?q=axios', '_blank', 'noopener,noreferrer');
  });

  it('timeout → search URL', async () => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockImplementation(({ signal }) =>
      new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      })
    );
    document.getElementById('package').value = 'axios';
    document.getElementById('npm').click();
    await vi.runAllTimersAsync();
    expect(window.open).toHaveBeenCalledWith('https://www.npmjs.com/search?q=axios', '_blank', 'noopener,noreferrer');
    vi.useRealTimers();
  });
});

describe('package input click clears message', () => {
  it('clicking #package after error → message hidden', () => {
    document.getElementById('package').value = '';
    document.getElementById('npm').click();
    document.getElementById('package').click();
    const message = document.getElementById('message');
    expect(message.style.display).toBe('none');
    expect(message.innerText).toBe('');
  });
});

describe('disclaimer visibility', () => {
  it('click #disclaimerButton → visible class added', () => {
    document.getElementById('disclaimerButton').click();
    expect(document.getElementById('disclaimerText').classList.contains('visible')).toBe(true);
  });

  it('mouseleave on #disclaimerButton → visible class removed', () => {
    document.getElementById('disclaimerButton').click();
    document.getElementById('disclaimerButton').dispatchEvent(new Event('mouseleave'));
    expect(document.getElementById('disclaimerText').classList.contains('visible')).toBe(false);
  });
});

describe('property: whitespace-only input always rejected', () => {
  it('whitespace-only input always rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({
          unit: fc.constantFrom(' ', '\t', '\n'),
          minLength: 1,
        }),
        async (whitespace) => {
          document.getElementById('package').value = whitespace;
          document.getElementById('npm').click();
          const message = document.getElementById('message');
          expect(message.style.display).toBe('block');
          expect(window.open).not.toHaveBeenCalled();
          // Reset between iterations
          window.open = vi.fn();
          document.getElementById('package').value = '';
          message.style.display = 'none';
          message.innerText = '';
          await Promise.resolve();
        },
      ),
    );
  });
});

describe('property: URL = base + trimmed name', () => {
  it('URL = base + trimmed name for all registries', async () => {
    const packageUrls = {
      crates: 'https://crates.io/crates/',
      go: 'https://pkg.go.dev/',
      npm: 'https://www.npmjs.com/package/',
      pypi: 'https://pypi.org/project/',
    };
    await fc.assert(
      fc.asyncProperty(
        fc.string({
          unit: fc.string({
            minLength: 1,
            maxLength: 1,
          }).filter(item => item.trim().length > 0),
          minLength: 1,
        }),
        fc.constantFrom('crates', 'go', 'npm', 'pypi'),
        async (name, registry) => {
          global.fetch = vi.fn().mockResolvedValue({ status: 200 });
          document.getElementById('package').value = name;
          document.getElementById(registry).click();
          await Promise.resolve();
          expect(window.open).toHaveBeenCalledWith(
            packageUrls[registry] + name,
            expect.anything(),
            expect.anything(),
          );
          // Reset between iterations
          window.open = vi.fn();
          await Promise.resolve();
        },
      ),
    );
  });
});

describe('property: window.open security arguments', () => {
  // Feature: extension-tests-2, Property 4: window.open is always called with correct tab and security arguments
  it('window.open always called with _blank and noopener,noreferrer', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({
          unit: fc.string({
            minLength: 1,
            maxLength: 1,
          }).filter(item => item.trim().length > 0),
          minLength: 1,
        }),
        fc.constantFrom('crates', 'go', 'npm', 'pypi'),
        async (name, registry) => {
          global.fetch = vi.fn().mockResolvedValue({ status: 200 });
          document.getElementById('package').value = name;
          document.getElementById(registry).click();
          await Promise.resolve();
          expect(window.open).toHaveBeenCalledWith(
            expect.anything(),
            '_blank',
            'noopener,noreferrer',
          );
          // Reset between iterations
          window.open = vi.fn();
          await Promise.resolve();
        },
      ),
    );
  });
});
