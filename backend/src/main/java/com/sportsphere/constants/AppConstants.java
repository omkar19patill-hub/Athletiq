package com.sportsphere.constants;

public final class AppConstants {

    private AppConstants() {}

    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String BOOKING_NUMBER_PREFIX = "BK";
    public static final int BOOKING_NUMBER_LENGTH = 8;

    public static final long REFUND_FULL_HOURS = 24L;
    public static final long REFUND_PARTIAL_HOURS = 6L;
    public static final double REFUND_FULL_PERCENT = 100.0;
    public static final double REFUND_PARTIAL_PERCENT = 50.0;
    public static final double REFUND_NONE_PERCENT = 0.0;
}
