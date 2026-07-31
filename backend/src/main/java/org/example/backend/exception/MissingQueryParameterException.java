package org.example.backend.exception;

/**
 * Der Aufrufer hat keine der erlaubten Parameter-Kombinationen mitgegeben.
 * Bewusst nicht InvalidDateRangeException: Hier ist kein Zeitraum falsch, es
 * fehlt die Angabe, WELCHE Shifts gemeint sind.
 */
public class MissingQueryParameterException extends RuntimeException {
    public MissingQueryParameterException(String message) {
        super(message);
    }
}
