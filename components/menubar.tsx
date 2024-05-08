import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { adjustPaper, connectClickHandler } from "@/lib/print";
import { SystemContext, applicationTypes } from "@/pages";
import React from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import SystemButton from "@/components/button";
import { Font, Text } from "@/components/ui/text";

export function SystemMenubar({}) {
  const [devices, setDevices] = React.useState<USBDevice[]>([]);
  const { openWindows, openWindow, menubar } = React.useContext(SystemContext);
  const [openPrintFeedDialog, setOpenPrintFeedDialog] = React.useState(false);
  const [printFeedNumber, setPrintFeedNumber] = React.useState("");

  const activeApp = openWindows[openWindows?.length - 1];

  console.log({ activeApp });

  React.useEffect(() => {
    const fetchDevices = async () => {
      const devices = await navigator.usb.getDevices();
      setDevices(devices);
    };
    // fetchDevices();
  }, []);
  return (
    <>
      <Menubar className="z-30">
        <MenubarMenu>
          <MenubarTrigger>
            <div className="h-full px-px flex items-center">
              <img
                src="/eaten_apple.png"
                className="h-[11px] w-[9px] mb-px relative -top-px"
                style={{
                  height: 11,
                  width: 9,
                }}
              />
            </div>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() =>
                openWindow({
                  title: "About This Mockintosh",
                  type: applicationTypes.ABOUT_THIS_MOCKINTOSH,
                })
              }
            >
              <Text font="ChiKareGo" text="About this Mockintosh..." />
            </MenubarItem>
            <MenubarSeparator />
            {devices.map((device) => (
              <MenubarItem
                key={device.vendorId}
                onClick={() => console.log({ device })}
              >
                <Text font="ChiKareGo" text={device.productName} />
              </MenubarItem>
            ))}

            <MenubarItem onClick={connectClickHandler}>
              <Text font="ChiKareGo" text="Connect printer" />
            </MenubarItem>
            <MenubarItem onClick={() => setOpenPrintFeedDialog(true)}>
              <Text font="ChiKareGo" text="Adjust paper feed" />
            </MenubarItem>

            <MenubarSeparator />
            <MenubarItem
              onClick={() =>
                openWindow({
                  type: applicationTypes.CONTROL_PANEL,
                })
              }
            >
              <Text font="ChiKareGo" text="Control Panel" />
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        {menubar.map((menu) => (
          <MenubarMenu key={menu.label}>
            <MenubarTrigger>
              <Text font="ChiKareGo" text={menu.label} />
            </MenubarTrigger>
            <MenubarContent>
              {menu.items.map((item) => {
                if (item.type === "radiogroup") {
                  return (
                    <MenubarRadioGroup
                      key={item.label}
                      value={item.value}
                      onValueChange={item.onValueChange}
                    >
                      {item.items.map((radioItem) => (
                        <MenubarRadioItem
                          key={radioItem.label}
                          value={radioItem.label}
                          disabled={radioItem.disabled}
                        >
                          <Text font="ChiKareGo" text={radioItem.label} />
                        </MenubarRadioItem>
                      ))}
                    </MenubarRadioGroup>
                  );
                }
                return (
                  <MenubarItem key={item.label} disabled={item.disabled}>
                    <Text font="ChiKareGo" text={item.label} />
                    {item.shortcut && (
                      <MenubarShortcut>
                        <Text font="ChiKareGo" text={item.shortcut} />
                      </MenubarShortcut>
                    )}
                  </MenubarItem>
                );
              })}
            </MenubarContent>
          </MenubarMenu>
        ))}
        {/* <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            New Folder <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Open <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>Print</MenubarItem>
          <MenubarItem disabled>Close</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger disabled>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            Cut <MenubarShortcut>⌘K</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>Clear</MenubarItem>
          <MenubarItem disabled>
            Select All <MenubarShortcut>⌘A</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Show Clipboard</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem disabled>By Small Icon</MenubarCheckboxItem>
          <MenubarCheckboxItem checked disabled>
            By Icon
          </MenubarCheckboxItem>
          <MenubarCheckboxItem disabled>By Name</MenubarCheckboxItem>
          <MenubarCheckboxItem disabled>By Date</MenubarCheckboxItem>
          <MenubarCheckboxItem disabled>By Size</MenubarCheckboxItem>
          <MenubarCheckboxItem disabled>By Kind</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Special</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>Clean Up Desktop</MenubarItem>
          <MenubarItem disabled>Empty Trash</MenubarItem>
          <MenubarItem disabled>Erase Disk</MenubarItem>
          <MenubarItem disabled>Set Startup...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Restart</MenubarItem>
          <MenubarItem disabled>Shut Down</MenubarItem>
        </MenubarContent>
      </MenubarMenu> */}
      </Menubar>
      <Dialog open={openPrintFeedDialog} onOpenChange={setOpenPrintFeedDialog}>
        <DialogContent>
          <div className="space-y-3">
            <div className="font-chicago">
              Print feed adjustment (-500 to +500 dots)
            </div>
            <Input
              value={printFeedNumber}
              onChange={(e) => setPrintFeedNumber(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2 items-center justify-end">
              <SystemButton onClick={() => setOpenPrintFeedDialog(false)}>
                Cancel
              </SystemButton>
              <SystemButton
                onClick={() => {
                  adjustPaper(Number(printFeedNumber));
                }}
              >
                Feed paper
              </SystemButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
