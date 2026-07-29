"use client";

/**
 * Password Protect / Unlock PDF, using @cantoo/pdf-lib's real
 * PDFDocument.encrypt() and password-aware PDFDocument.load(). This is a
 * genuine capability gap in the base pdf-lib package (confirmed by
 * inspecting its SaveOptions type — no encrypt fields exist there); the
 * @cantoo fork adds a full PDFSecurity implementation with owner/user
 * passwords and a real UserPermissions bitmask, which is what makes both
 * directions of this operation possible without a server.
 */
import { PDFDocument } from "@cantoo/pdf-lib";

/**
 * @param {File|ArrayBuffer} file
 * @param {object} opts
 * @param {string} [opts.userPassword] - required to open the document
 * @param {string} [opts.ownerPassword] - required to change permissions/remove protection
 * @param {object} [opts.permissions] - e.g. { printing: 'lowResolution', modifying: false, copying: false }
 */
export async function passwordProtectPdf(file, opts) {
  const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);

  if (!opts.userPassword && !opts.ownerPassword) {
    throw new Error("Enter at least an owner password to protect this PDF.");
  }

  doc.encrypt({
    userPassword: opts.userPassword || undefined,
    ownerPassword: opts.ownerPassword || opts.userPassword,
    permissions: {
      printing: opts.permissions?.allowPrinting === false ? undefined : "highResolution",
      modifying: opts.permissions?.allowModifying ?? false,
      copying: opts.permissions?.allowCopying ?? false,
      annotating: opts.permissions?.allowAnnotating ?? false,
      fillingForms: opts.permissions?.allowFillingForms ?? true,
      contentAccessibility: true,
      documentAssembly: opts.permissions?.allowAssembly ?? false,
    },
  });

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

/**
 * Removes password protection from a PDF the caller has the password for.
 * The person must supply the correct password (matching PRD 10.1.9's
 * compliance requirement of "supply current password" rather than
 * cracking protection they don't have rights to).
 */
export async function unlockPdf(file, password) {
  const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  let doc;
  try {
    doc = await PDFDocument.load(bytes, { password });
  } catch (err) {
    if (/password/i.test(err?.message || "")) {
      throw new Error("That password doesn't match this PDF. Please check it and try again.");
    }
    throw err;
  }
  // Re-saving without calling .encrypt() produces an unencrypted output.
  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

/** Detects whether a PDF is password-protected without needing the password. */
export async function isPdfEncrypted(file) {
  const bytes = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  try {
    await PDFDocument.load(bytes, { ignoreEncryption: false });
    return false;
  } catch (err) {
    return /password|encrypt/i.test(err?.message || "");
  }
}
