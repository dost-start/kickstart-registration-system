"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DataPrivacyDialogProps {
  children: React.ReactNode;
  onAgree?: () => void;
}

export default function DataPrivacyDialog({
  children,
  onAgree,
}: DataPrivacyDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="!max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-summit-black">
            Data Privacy Policy
          </DialogTitle>
          <DialogDescription className="text-summit-black/70">
            Scholars Transforming Advancement and Research for Technology (START) - DOST
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] px-6">
          <div className="space-y-6 text-sm leading-relaxed text-summit-black">
            <div>
              <p className="mb-4">
                <span className="font-bold">
                  Scholars Transforming Advancement and Research for Technology (START) - DOST
                </span>{" "}
                is committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, store, and protect your data in accordance with the Data Privacy Act of 2012 (RA 10173) and its implementing rules and regulations (IRR).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-summit-blue mb-3">
                Purpose of Data Collection
              </h3>
              <p className="mb-3">
                START-DOST collects personal information solely for legitimate
                organizational purposes, which may include but not limited to managing your KickSTART registration, event communication, and other organizational purposes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-summit-teal mb-3">
                Who We Share Personal Data With
              </h3>
              <p>
                As a general principle, START-DOST does not share personal data with
                third parties unless it is necessary for fulfilling specific
                processes related to a declared purpose or as required by law.
                When sharing is necessary, it is only with authorized and
                relevant partners (e.g., DOST Regional Offices, DOST-SEI), in accordance with legal requirements.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-summit-pink mb-3">
                Data Retention Period
              </h3>
              <p>
                Your personal data will be retained only for as long as
                it serves the purpose for which it was collected, or as required
                by legal or regulatory obligations.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-summit-orange mb-3">
                Your Rights
              </h3>
              <p>
                In accordance with Rule VIII, Section 34 of the IRR of RA 10173,
                START-DOST is committed to upholding your rights as outlined in the
                Data Subject Rights by the National Privacy Commission (NPC).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-summit-navy mb-3">
                Contact Information
              </h3>
              <p>
                For any questions, complaints, or concerns regarding privacy,
                please reach out through your DOST Regional Office or contact DOST-SEI.
              </p>
            </div>

            <div className="bg-summit-blue/5 p-4 rounded-lg border border-summit-blue/20">
              <h3 className="text-lg font-semibold text-summit-blue mb-3">
                Consent Requirement
              </h3>
              <p>
                By filling out this form, you acknowledge that you have read,
                understood, and agree to authorize the collection, storage,
                sharing, and processing of your personal data for organizational
                purposes, in compliance with the Data Privacy Act of 2012 (RA 10173) and applicable
                regulations. If you do not agree with our policies, please
                refrain from filling out this form.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-4">
          <DialogClose asChild>
            <Button
              className="w-full bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white"
              onClick={() => onAgree?.()}
            >
              I Understand
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
