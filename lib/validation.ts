import { AccountType } from "./generated/prisma/enums";


export class AccountingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountingValidationError";
  }
}

export function validateTransactionEntries(
  entries: Array<{
    accountId: number;
    debit: number;
    credit: number;
  }>
) {
  // Rule 1: Minimum 2 entries
  if (entries.length < 2) {
    throw new AccountingValidationError(
      "Transaction must have at least 2 entries"
    );
  }

  // Rule 2: Each entry must have debit OR credit, not both
  for (const [index, entry] of entries.entries()) {
    const hasDebit = Number(entry.debit) > 0;
    const hasCredit = Number(entry.credit) > 0;

    if (hasDebit && hasCredit) {
      throw new AccountingValidationError(
        `Entry ${index + 1}: Cannot have both debit and credit amounts`
      );
    }

    if (!hasDebit && !hasCredit) {
      throw new AccountingValidationError(
        `Entry ${index + 1}: Must have either debit or credit amount`
      );
    }

    if (entry.debit < 0 || entry.credit < 0) {
      throw new AccountingValidationError(
        `Entry ${index + 1}: Amounts cannot be negative`
      );
    }
  }

  // Rule 3: Total debits must equal total credits
  const totalDebits = entries.reduce(
    (sum, entry) => sum + Number(entry.debit),
    0
  );
  const totalCredits = entries.reduce(
    (sum, entry) => sum + Number(entry.credit),
    0
  );

  const tolerance = 0.01; // Allow small floating point differences

  if (Math.abs(totalDebits - totalCredits) > tolerance) {
    throw new AccountingValidationError(
      `Total debits (${totalDebits.toFixed(
        2
      )}) do not equal total credits (${totalCredits.toFixed(2)})`
    );
  }
}

export function calculateBalanceChange(
  accountType: AccountType,
  debit: number,
  credit: number
): number {
  // Assets & Expenses: Debits increase, Credits decrease
  if (accountType === "ASSET" || accountType === "EXPENSE") {
    return Number(debit) - Number(credit);
  }
  // Liabilities, Equity, Revenue: Credits increase, Debits decrease
  else {
    return Number(credit) - Number(debit);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
