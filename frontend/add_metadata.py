import os
import re

metadata_template = """
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '{title} - Meritmaster',
  description: 'Master your exams with Meritmaster. The ultimate PPSC, FPSC, NTS preparation platform.',
  openGraph: {
    title: '{title} - Meritmaster',
    description: 'Master your exams with Meritmaster.',
    images: ['/images/og-card.png'],
  }
};
"""

pages = {
    'src/app/terms/page.tsx': 'Terms of Service',
    'src/app/privacy/page.tsx': 'Privacy Policy',
    'src/app/dashboard/page.tsx': 'Dashboard',
    'src/app/subscription/page.tsx': 'Premium Subscription',
    'src/app/admin/page.tsx': 'Admin Portal',
    'src/app/exam/page.tsx': 'Final Assessment',
    'src/app/page.tsx': 'PPSC Preparation SaaS'
}

for filepath, title in pages.items():
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        if 'export const metadata' not in content and 'use client' not in content:
            meta = metadata_template.replace('{title}', title)
            # Insert after the last import
            imports = list(re.finditer(r'^import .*;', content, re.MULTILINE))
            if imports:
                last_import = imports[-1]
                insert_idx = last_import.end()
                new_content = content[:insert_idx] + "\n" + meta + content[insert_idx:]
            else:
                new_content = meta + content
                
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Added metadata to {filepath}")
