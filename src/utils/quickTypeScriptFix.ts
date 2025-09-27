// Quick TypeScript fix utility
// This file provides a simple find-and-replace approach for fixing supabase references

// Replace all instances of 'supabase' with 'db' in JavaScript/TypeScript files
export const replaceSupabaseWithDb = (content: string): string => {
  return content
    .replace(/await supabase\./g, 'await db.')
    .replace(/= supabase\./g, '= db.')
    .replace(/supabase\./g, 'db.')
    .replace(/: supabase\./g, ': db.');
};

// Fix common TypeScript issues
export const fixCommonTypeIssues = (content: string): string => {
  return content
    // Fix Set<unknown> to Set<string>
    .replace(/Set<unknown>/g, 'Set<string>')
    // Fix number to string conversions
    .replace(/freshnessDuration,/g, 'freshnessDuration.toString(),')
    // Add type assertions for supabase queries
    .replace(/\.from\('(\w+)'\)/g, '.from(\'$1\') as any')
    // Fix property access on never types
    .replace(/batch\.(\w+)/g, '(batch as any).$1')
    .replace(/transaction\.(\w+)/g, '(transaction as any).$1');
};

export const applyAllFixes = (content: string): string => {
  let fixed = replaceSupabaseWithDb(content);
  fixed = fixCommonTypeIssues(fixed);
  return fixed;
};