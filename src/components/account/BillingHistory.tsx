import * as React from 'react';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface InvoiceRecord {
  id: string;               // unique invoice ID
  date: string;            // e.g. '2025-04-01'
  description: string;     // e.g. 'Creator Plan – 30 credits'
  amount: string;          // e.g. '$14.00'
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl: string;      // link to PDF receipt
}

interface BillingHistoryProps {
  records: InvoiceRecord[];        // list of invoices
  isLoading: boolean;              // loading state
  error?: string;                  // error message, if any
  onRetry?: () => void;            // callback to reload data
}

const StatusBadge: React.FC<{ status: InvoiceRecord['status'] }> = ({ status }) => {
  const styles = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    failed: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
  };

  return (
    <span className={cn(
      'px-2 py-1 rounded-full text-xs font-medium capitalize',
      styles[status]
    )}>
      {status}
    </span>
  );
};

const BillingHistory: React.FC<BillingHistoryProps> = ({
  records,
  isLoading,
  error,
  onRetry,
}) => {
  // Format date to locale string
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center"
        aria-busy="true"
      >
        <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Loading billing history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 text-sm font-medium 
                     text-gray-700 bg-white border border-gray-300 rounded-md 
                     hover:bg-gray-50 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-blue-500
                     dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 
                     dark:hover:bg-gray-600"
            aria-label="Retry loading billing history"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No billing history found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Date
              </th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Description
              </th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Amount
              </th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Status
              </th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {records.map((record) => (
              <tr 
                key={record.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(record.date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  {record.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {record.amount}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                  <a
                    href={record.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 
                             hover:text-blue-800 dark:hover:text-blue-300"
                    aria-label={`View invoice for ${record.description} from ${formatDate(record.date)}`}
                  >
                    View
                    <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingHistory; 