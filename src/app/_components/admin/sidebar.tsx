"use client";

import React, { useState } from "react";
import {
  Home,
  DollarSign,
  Monitor,
  ShoppingCart,
  Tag,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

export const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <nav
      className={cn(
        "sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out p-2 shadow-sm z-10",
        open ? "w-64" : "w-16",
        "bg-sidebar border-sidebar-border text-sidebar-foreground"
      )}
    >
      <TitleSection open={open} />

      <div className="space-y-1 mb-8">
        <Option
          Icon={Home}
          title="Dashboard"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={DollarSign}
          title="Sales"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={3}
        />
        <Option
          Icon={Monitor}
          title="View Site"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={ShoppingCart}
          title="Products"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Tag}
          title="Tags"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={BarChart3}
          title="Analytics"
          selected={selected}
          setSelected={setSelected}
          open={open}
        />
        <Option
          Icon={Users}
          title="Members"
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={12}
        />
      </div>

      {open && (
        <div className="border-t border-sidebar-border pt-4 space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
            Account
          </div>
          <Option
            Icon={Settings}
            title="Settings"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
          <Option
            Icon={HelpCircle}
            title="Help & Support"
            selected={selected}
            setSelected={setSelected}
            open={open}
          />
        </div>
      )}

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

interface OptionProps {
  Icon: LucideIcon;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number;
}

const Option = ({ Icon, title, selected, setSelected, open, notifs }: OptionProps) => {
  const isSelected = selected === title;

  return (
    <button
      onClick={() => setSelected(title)}
      className={cn(
        "relative flex h-11 w-full items-center rounded-md transition-all duration-200",
        isSelected
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
       <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>

      {open && (
        <span
          className={cn(
            "text-sm font-medium transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        >
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open }: { open: boolean }) => {
  return (
    <div className="mb-6 border-b border-sidebar-border pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-sidebar-accent/50">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div
              className={cn(
                "transition-opacity duration-200",
                open ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-sidebar-foreground">
                    MeritMatch
                  </span>
                  <span className="block text-xs text-sidebar-foreground/70">
                    Admin Panel
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {open && <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-primary text-primary-foreground shadow-sm">
      <div className="font-bold text-xl">M</div>
    </div>
  );
};

const ToggleClose = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border transition-colors hover:bg-sidebar-accent/50"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={cn(
              "h-4 w-4 transition-transform duration-300 text-sidebar-foreground/70",
              open ? "rotate-180" : ""
            )}
          />
        </div>
        {open && (
          <span
            className={cn(
              "text-sm font-medium text-sidebar-foreground transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            Hide
          </span>
        )}
      </div>
    </button>
  );
};
