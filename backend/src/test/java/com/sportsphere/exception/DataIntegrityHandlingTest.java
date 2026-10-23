package com.sportsphere.exception;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

/** D2: constraint violations are 409 without SQL details; schema.sql no longer makes slot_id unique. */
class DataIntegrityHandlingTest {

    @Test
    void dataIntegrityViolationMapsTo409WithoutSqlDetails() {
        var cause = new SQLIntegrityConstraintViolationException("Duplicate entry '30' for key 'bookings.UK_slot_id'");
        var res = new GlobalExceptionHandler()
                .handleDataIntegrityViolation(new DataIntegrityViolationException("could not execute statement", cause));

        assertEquals(HttpStatus.CONFLICT, res.getStatusCode());
        assertFalse(res.getBody().isSuccess());
        String msg = res.getBody().getMessage();
        assertFalse(msg.contains("Duplicate entry") || msg.contains("UK_") || msg.contains("bookings"));
    }

    @Test
    void schemaSqlDoesNotMakeBookingSlotIdUnique() throws Exception {
        // Static text check only (Maven runs tests from backend/); never touches a database
        String sql = Files.readString(Path.of("..", "database", "schema.sql"));
        String bookings = sql.substring(sql.indexOf("CREATE TABLE IF NOT EXISTS bookings"));
        bookings = bookings.substring(0, bookings.indexOf(";"));
        String codeOnly = bookings.replaceAll("--[^\\n]*", "");

        assertTrue(Pattern.compile("slot_id\\s+BIGINT UNSIGNED NOT NULL\\s*,").matcher(codeOnly).find());
        assertFalse(Pattern.compile("slot_id[^,\\n]*UNIQUE").matcher(codeOnly).find(), "slot_id must not be UNIQUE");
        assertFalse(Pattern.compile("UNIQUE\\s*(KEY|INDEX)?[^\\n]*\\(\\s*slot_id\\s*\\)").matcher(codeOnly).find());
        // Foreign key and plain index are still there
        assertTrue(codeOnly.contains("FOREIGN KEY (slot_id)"));
        assertTrue(codeOnly.contains("INDEX idx_bookings_slot"));
        assertFalse(sql.contains("DROP TABLE"), "D1: schema.sql must stay non-destructive");
    }
}
