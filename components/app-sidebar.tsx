'use client';

import * as React from 'react';

import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ChartHistogramIcon,
  UserGroupIcon,
  Database01Icon,
  Folder01Icon,
  Analytics01Icon,
} from '@hugeicons/core-free-icons';
import type { SessionUser } from '@/lib/auth';

const navItems = (role: SessionUser['role']) => [
  {
    title: 'Transacciones',
    url: '/dashboard',
    icon: <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} />,
  },
  {
    title: 'Maestros',
    url: '/maestros',
    icon: <HugeiconsIcon icon={Database01Icon} strokeWidth={2} />,
  },
  {
    title: 'Habitaciones',
    url: '/habitaciones',
    icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
  },
  {
    title: 'Reservas',
    url: '/reservas',
    icon: <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />,
  },
  ...(role === 'ADMIN'
    ? [
        {
          title: 'Usuarios',
          url: '/users',
          icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
        },
      ]
    : []),
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SessionUser }) {
  const navSecondary = React.useMemo(() => navItems(user.role), [user.role]);

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <a href='/transacciones'>
                <Image src='/LogoGreen.png' alt='Logo' width={72} height={72} className='' />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSecondary items={navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
