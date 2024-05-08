export const generateTransactionsCSVFileKey = (walletId: string) => {
	return `CSV/transactions/${walletId}/transactions_${Date.now()}.csv`
}
