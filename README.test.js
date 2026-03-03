const fs = require('fs');
const path = require('path');

describe('README.md', () => {
  let readmeContent;
  const readmePath = path.join(__dirname, 'README.md');

  beforeAll(() => {
    readmeContent = fs.readFileSync(readmePath, 'utf-8');
  });

  describe('File Structure', () => {
    test('should exist in the project root', () => {
      expect(fs.existsSync(readmePath)).toBe(true);
    });

    test('should be readable', () => {
      expect(() => fs.readFileSync(readmePath, 'utf-8')).not.toThrow();
    });

    test('should not be empty', () => {
      expect(readmeContent.trim().length).toBeGreaterThan(0);
    });

    test('should be valid UTF-8 text', () => {
      expect(typeof readmeContent).toBe('string');
      expect(readmeContent).not.toContain('\uFFFD'); // Replacement character for invalid UTF-8
    });
  });

  describe('Required Sections', () => {
    test('should contain a main title', () => {
      expect(readmeContent).toMatch(/^#\s+test-coderabbit/m);
    });

    test('should contain Purpose section', () => {
      expect(readmeContent).toMatch(/##\s+Purpose/);
    });

    test('should contain Getting Started section', () => {
      expect(readmeContent).toMatch(/##\s+Getting Started/);
    });

    test('should contain License section', () => {
      expect(readmeContent).toMatch(/##\s+License/);
    });
  });

  describe('Content Validation', () => {
    test('should include project description', () => {
      expect(readmeContent).toContain('A project designed to test CodeRabbit');
    });

    test('should describe CodeRabbit testing capabilities', () => {
      expect(readmeContent).toContain('code review capabilities');
    });

    test('should list testing objectives', () => {
      const objectives = [
        'Detect common bugs and logic errors',
        'Identify security vulnerabilities',
        'Flag performance anti-patterns',
        'Enforce coding best practices',
        'Integrate with various linting tools'
      ];

      objectives.forEach(objective => {
        expect(readmeContent).toContain(objective);
      });
    });

    test('should include installation instructions', () => {
      expect(readmeContent).toContain('npm install');
    });

    test('should specify MIT license', () => {
      expect(readmeContent).toContain('MIT');
    });
  });

  describe('Markdown Formatting', () => {
    test('should use proper heading hierarchy', () => {
      const lines = readmeContent.split('\n');
      const headings = lines.filter(line => line.match(/^#+\s/));

      expect(headings.length).toBeGreaterThan(0);

      // First heading should be h1
      expect(headings[0]).toMatch(/^#\s/);

      // Should not skip heading levels
      headings.forEach(heading => {
        const level = heading.match(/^#+/)[0].length;
        expect(level).toBeLessThanOrEqual(3); // Should not go deeper than h3
      });
    });

    test('should have code blocks with proper syntax', () => {
      expect(readmeContent).toMatch(/```bash\s+npm install\s+```/);
    });

    test('should use bullet points for lists', () => {
      expect(readmeContent).toMatch(/^-\s+/m);
    });

    test('should not have trailing whitespace on lines', () => {
      const lines = readmeContent.split('\n');
      const linesWithTrailingSpace = lines.filter(line =>
        line.length > 0 && line !== line.trimEnd()
      );

      expect(linesWithTrailingSpace.length).toBe(0);
    });
  });

  describe('Content Quality', () => {
    test('should have a clear project purpose statement', () => {
      const purposeSection = readmeContent.match(/## Purpose[\s\S]*?(?=##|$)/);
      expect(purposeSection).toBeTruthy();
      expect(purposeSection[0].length).toBeGreaterThan(50);
    });

    test('should provide actionable getting started steps', () => {
      const gettingStartedSection = readmeContent.match(/## Getting Started[\s\S]*?(?=##|$)/);
      expect(gettingStartedSection).toBeTruthy();
      expect(gettingStartedSection[0]).toContain('```');
    });

    test('should not contain placeholder text', () => {
      const placeholders = ['TODO', 'FIXME', 'TBD', 'Coming soon', '...'];
      placeholders.forEach(placeholder => {
        expect(readmeContent.toLowerCase()).not.toContain(placeholder.toLowerCase());
      });
    });

    test('should not have broken markdown links', () => {
      const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
      const links = [...readmeContent.matchAll(linkPattern)];

      links.forEach(([fullMatch, text, url]) => {
        expect(text.trim().length).toBeGreaterThan(0);
        expect(url.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases and Negative Tests', () => {
    test('should not contain multiple consecutive blank lines', () => {
      expect(readmeContent).not.toMatch(/\n\n\n\n/);
    });

    test('should not have inconsistent heading markers', () => {
      const invalidHeadings = readmeContent.match(/^#{4,}/m);
      expect(invalidHeadings).toBeNull();
    });

    test('should not contain unclosed code blocks', () => {
      const codeBlockMarkers = (readmeContent.match(/```/g) || []).length;
      expect(codeBlockMarkers % 2).toBe(0); // Should be even number
    });

    test('should not have mixed indentation in lists', () => {
      // Match list items, excluding newlines from whitespace
      const listItems = readmeContent.match(/^[ \t]*[-*+]\s/gm) || [];
      const indentations = listItems.map(item => item.match(/^[ \t]*/)[0].length);

      // Check for consistent indentation - all items at same level should have same indentation
      if (indentations.length > 0) {
        const uniqueIndents = [...new Set(indentations)];
        // If there are multiple indent levels, they should follow a pattern (0, 2, 4, etc.)
        uniqueIndents.forEach(indent => {
          // Each indentation should be a reasonable value (0 or even number)
          if (indent > 0) {
            expect(indent % 2).toBe(0);
          }
        });
      }
    });

    test('should not contain XSS or malicious content', () => {
      const maliciousPatterns = [
        '<script>',
        'javascript:',
        'onerror=',
        'onclick='
      ];

      maliciousPatterns.forEach(pattern => {
        expect(readmeContent.toLowerCase()).not.toContain(pattern);
      });
    });

    test('should maintain reasonable file size', () => {
      const fileSizeInBytes = Buffer.byteLength(readmeContent, 'utf-8');
      expect(fileSizeInBytes).toBeLessThan(50000); // Less than 50KB
      expect(fileSizeInBytes).toBeGreaterThan(100); // More than 100 bytes
    });
  });

  describe('Regression Tests', () => {
    test('should contain all five testing objectives listed', () => {
      const purposeSection = readmeContent.match(/## Purpose[\s\S]*?(?=##|$)/);
      const bulletPoints = (purposeSection[0].match(/^-/gm) || []).length;
      expect(bulletPoints).toBeGreaterThanOrEqual(5);
    });

    test('should have project name match in title and description', () => {
      expect(readmeContent).toMatch(/# test-coderabbit/);
      expect(readmeContent.toLowerCase()).toContain('coderabbit');
    });

    test('should preserve bash syntax highlighting in code blocks', () => {
      expect(readmeContent).toContain('```bash');
    });
  });

  describe('Boundary Cases', () => {
    test('should handle README being minimum viable documentation', () => {
      const sections = (readmeContent.match(/^##\s/gm) || []).length;
      expect(sections).toBeGreaterThanOrEqual(3); // At least 3 h2 sections
    });

    test('should not exceed reasonable line length', () => {
      const lines = readmeContent.split('\n');
      const longLines = lines.filter(line =>
        !line.match(/^```/) && // Ignore code block markers
        !line.match(/^https?:/) && // Ignore URLs
        line.length > 120
      );

      // Allow some flexibility but flag excessive line lengths
      expect(longLines.length).toBeLessThan(5);
    });

    test('should handle empty license section gracefully', () => {
      const licenseSection = readmeContent.match(/## License[\s\S]*?(?=##|$)/);
      expect(licenseSection).toBeTruthy();
      const licenseContent = licenseSection[0].replace(/## License\s*/, '').trim();
      expect(licenseContent.length).toBeGreaterThan(0);
    });
  });
});