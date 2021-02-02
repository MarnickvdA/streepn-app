export enum ErrorMessage {
    // GENERAL
    INTERNAL = 'errors.functions.internal',
    UNAUTHENTICATED = 'errors.functions.unauthenticated',
    PERMISSION_DENIED = 'errors.functions.permission_denied',
    INVALID_DATA = 'errors.functions.invalid_data',

    // GROUPS
    GROUP_NOT_FOUND = 'errors.functions.group_not_found',
    USER_ACCOUNT_NOT_FOUND = 'errors.functions.user_account_not_found',
    SHARED_ACCOUNT_NOT_FOUND = 'errors.functions.shared_account_not_found',
    PRODUCT_NOT_FOUND = 'errors.functions.product_not_found',
    NOT_MEMBER_OF_GROUP = 'errors.functions.group_not_member',
    GROUP_LEAVE_DENIED = 'errors.functions.group_leave_denied',
    INVALID_GROUP_CODE = 'errors.functions.group_code_invalid',
    EXPIRED_GROUP_CODE = 'errors.functions.group_code_expired',

    // STOCKS
    STOCK_NOT_FOUND = 'errors.functions.stock_not_found',

    // TRANSACTIONS
    TRANSACTION_NOT_FOUND = 'errors.functions.transaction_not_found',
}
