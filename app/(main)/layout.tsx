import { getSessionUser } from '@/lib/auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();

  return (
    <TooltipProvider>
      {sessionUser ? (
        <SidebarProvider
          style={
                  {
                    ['--sidebar-width' as string]: 'calc(var(--spacing) * 72)',
                    ['--header-height' as string]: 'calc(var(--spacing) * 12)',
                  }
                }
        >
          <AppSidebar user={sessionUser} variant='inset' />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      ) : (
        children
      )}
    </TooltipProvider>
  );
}
