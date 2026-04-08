import path from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '../../..');

function projectFor(pkg: string): Project {
  const project = new Project({
    tsConfigFilePath: path.join(ROOT, 'packages', pkg, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  });
  return project;
}

function importsOf(pkg: string): string[] {
  const project = projectFor(pkg);
  const imports: string[] = [];
  for (const file of project.getSourceFiles()) {
    for (const decl of file.getImportDeclarations()) {
      imports.push(decl.getModuleSpecifierValue());
    }
  }
  return imports;
}

describe('Package dependency rules', () => {
  it('shared must not import from backend', () => {
    const imports = importsOf('shared');
    const violations = imports.filter((i) => i.includes('@shadow/backend'));
    expect(violations).toEqual([]);
  });

  it('shared must not import from git-server', () => {
    const imports = importsOf('shared');
    const violations = imports.filter((i) => i.includes('@shadow/git-server'));
    expect(violations).toEqual([]);
  });

  it('shared must not import from e2e', () => {
    const imports = importsOf('shared');
    const violations = imports.filter((i) => i.includes('@shadow/e2e'));
    expect(violations).toEqual([]);
  });

  it('shared must not import Node.js built-ins (must stay environment-agnostic)', () => {
    const project = projectFor('shared');
    const violations: string[] = [];
    for (const file of project.getSourceFiles()) {
      // Only enforce on src files, not tests
      if (file.getFilePath().includes('/tests/')) continue;
      for (const decl of file.getImportDeclarations()) {
        const spec = decl.getModuleSpecifierValue();
        if (spec.startsWith('node:')) {
          violations.push(`${file.getBaseName()}: ${spec}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('backend must not import from git-server', () => {
    const imports = importsOf('backend');
    const violations = imports.filter((i) => i.includes('@shadow/git-server'));
    expect(violations).toEqual([]);
  });

  it('backend must not import from e2e', () => {
    const imports = importsOf('backend');
    const violations = imports.filter((i) => i.includes('@shadow/e2e'));
    expect(violations).toEqual([]);
  });

  it('git-server must not import from shared', () => {
    const imports = importsOf('git-server');
    const violations = imports.filter((i) => i.includes('@shadow/shared'));
    expect(violations).toEqual([]);
  });

  it('git-server must not import from backend', () => {
    const imports = importsOf('git-server');
    const violations = imports.filter((i) => i.includes('@shadow/backend'));
    expect(violations).toEqual([]);
  });

  it('git-server must not import from e2e', () => {
    const imports = importsOf('git-server');
    const violations = imports.filter((i) => i.includes('@shadow/e2e'));
    expect(violations).toEqual([]);
  });
});

describe('Cross-package import rules', () => {
  const SHARED_CONCRETE_EXPORTS = [
    'GitStorage',
    'Router',
    'Engine',
    'HtmlRenderer',
    'TemplateBody',
    'Url',
    'Surl',
    'FileName',
    'MimeType',
    'ContentTypeHeader',
    'ShadowGitUrlHeader',
    'GitServerUrl',
  ];

  function concreteImportsFromShared(
    pkg: string,
    excludeFile?: string,
  ): string[] {
    const project = projectFor(pkg);
    const violations: string[] = [];
    for (const file of project.getSourceFiles()) {
      const filePath = file.getFilePath();
      if (excludeFile != null && filePath.endsWith(excludeFile)) continue;
      for (const decl of file.getImportDeclarations()) {
        if (!decl.getModuleSpecifierValue().includes('@shadow/shared'))
          continue;
        if (decl.isTypeOnly()) continue;
        for (const named of decl.getNamedImports()) {
          if (named.isTypeOnly()) continue;
          const name = named.getName();
          if (SHARED_CONCRETE_EXPORTS.includes(name)) {
            violations.push(
              `${file.getBaseName()}: imports concrete '${name}' from @shadow/shared`,
            );
          }
        }
      }
    }
    return violations;
  }

  it('backend (except main.ts) must only import interfaces from @shadow/shared', () => {
    const violations = concreteImportsFromShared('backend', '/main.ts');
    expect(violations).toEqual([]);
  });

  it('e2e must only import interfaces from @shadow/shared', () => {
    const violations = concreteImportsFromShared('e2e');
    expect(violations).toEqual([]);
  });
});

describe('Domain modeling rules', () => {
  it('interfaces in shared must not expose primitive types in method signatures', () => {
    const project = projectFor('shared');
    const primitives = new Set([
      'string',
      'number',
      'boolean',
      'any',
      'object',
    ]);
    const violations: string[] = [];

    for (const file of project.getSourceFiles()) {
      if (file.getFilePath().includes('/tests/')) continue;

      for (const iface of file.getInterfaces()) {
        for (const method of iface.getMethods()) {
          // Check return type
          const returnType = method.getReturnTypeNode();
          if (returnType != null) {
            const typeText = returnType.getText();
            for (const prim of primitives) {
              if (typeText === prim) {
                violations.push(
                  `${file.getBaseName()} / ${iface.getName()}.${method.getName()}() return type: ${typeText}`,
                );
              }
            }
          }

          // Check parameter types
          for (const param of method.getParameters()) {
            const paramType = param.getTypeNode();
            if (paramType != null) {
              const typeText = paramType.getText();
              for (const prim of primitives) {
                if (typeText === prim) {
                  violations.push(
                    `${file.getBaseName()} / ${iface.getName()}.${method.getName()}(${param.getName()}: ${typeText})`,
                  );
                }
              }
            }
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('classes in shared/src must use private constructors (factory pattern)', () => {
    const project = projectFor('shared');
    const violations: string[] = [];

    for (const file of project.getSourceFiles()) {
      if (file.getFilePath().includes('/tests/')) continue;

      for (const cls of file.getClasses()) {
        for (const ctor of cls.getConstructors()) {
          const isPrivate =
            ctor.getModifiers().some((m) => m.getText() === 'private') ||
            ctor.hasModifier(SyntaxKind.PrivateKeyword);
          if (!isPrivate) {
            violations.push(
              `${file.getBaseName()} / ${cls.getName() ?? 'anonymous'}: constructor is not private`,
            );
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
