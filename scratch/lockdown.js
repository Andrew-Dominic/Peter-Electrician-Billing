const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../src/app/actions');
const appDir = path.join(__dirname, '../src/app');

// 1. Process Actions
const actionFiles = ['bill.ts', 'customer.ts', 'material.ts', 'settings.ts'];
for (const file of actionFiles) {
    const filePath = path.join(actionsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not exists
    if (!content.includes('import { getSession }')) {
        content = content.replace('import prisma from "@/lib/prisma";', 'import prisma from "@/lib/prisma";\nimport { getSession } from "@/lib/auth";');
    }
    
    // Find all export async function and add the session check
    content = content.replace(/export async function (\w+)\((.*?)\) {/g, (match, funcName, args) => {
        return `${match}\n  const session = await getSession();\n  if (!session) throw new Error("Unauthorized");`;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated action ${file}`);
}

// 2. Process Pages
const pageFiles = [
    'page.tsx', 
    'bills/page.tsx', 
    'bills/new/page.tsx', 
    'customers/page.tsx', 
    'materials/page.tsx', 
    'settings/page.tsx'
];

for (const file of pageFiles) {
    const filePath = path.join(appDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add imports if not exists
    if (!content.includes('import { getSession }')) {
        if (content.includes('import prisma from "@/lib/prisma";')) {
            content = content.replace('import prisma from "@/lib/prisma";', 'import prisma from "@/lib/prisma";\nimport { getSession } from "@/lib/auth";\nimport { redirect } from "next/navigation";');
        } else {
            // Find last import
            const lastImportIndex = content.lastIndexOf('import ');
            const endOfLine = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLine) + '\nimport { getSession } from "@/lib/auth";\nimport { redirect } from "next/navigation";' + content.slice(endOfLine);
        }
    }
    
    // Replace export default async function
    content = content.replace(/export default async function (\w+)\((.*?)\) {/g, (match) => {
        return `${match}\n  const session = await getSession();\n  if (!session) redirect("/login");`;
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated page ${file}`);
}
