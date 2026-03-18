import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type CalendarGridProps = {
  checkedDates: Set<string>;
};

type Cell = {
  day: number | null;
  iso: string | null;
  checked: boolean;
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildCalendarRows(year: number, month: number, checkedDates: Set<string>): Cell[][] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Cell[] = [];
  // pad start (convert Sun-first to Mon-first: offset = (firstDay + 6) % 7)
  const offset = (firstDay + 6) % 7;
  for (let i = 0; i < offset; i++) cells.push({ day: null, iso: null, checked: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, iso, checked: checkedDates.has(iso) });
  }
  const rows: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function CalendarGrid({ checkedDates }: CalendarGridProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const goToPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const goToNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const rows = buildCalendarRows(viewYear, viewMonth, checkedDates);

  const handleCellPress = (cell: Cell) => {
    if (!cell.checked || cell.iso === null) return;
    setSelectedDay((prev) => (prev === cell.iso ? null : cell.iso));
  };

  return (
    <View style={styles.container}>
      {/* Month nav */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={goToPrev} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity onPress={goToNext} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Day-of-week header */}
      <View style={styles.headerRow}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={styles.headerCell}>
            <Text style={styles.headerText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar rows */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.weekRow}>
          {row.map((cell, cellIdx) => (
            <TouchableOpacity
              key={cellIdx}
              style={styles.dayCell}
              onPress={() => handleCellPress(cell)}
              activeOpacity={cell.checked ? 0.6 : 1}
            >
              <Text style={[styles.dayText, cell.day === null && styles.emptyDay]}>
                {cell.day ?? ''}
              </Text>
              {cell.checked && <View style={styles.dot} />}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Inline tooltip */}
      {selectedDay !== null && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipDate}>
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.tooltipSub}>Checked in</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthLabel: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 15,
    color: Colors.text,
  },

  headerRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontFamily: Fonts.jost,
    fontSize: 11,
    color: Colors.textMuted,
  },

  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayText: {
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: Colors.text,
  },
  emptyDay: {
    color: Colors.textMuted,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },

  tooltip: {
    backgroundColor: Colors.cardTintPurpleFaint,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  tooltipDate: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 13,
    color: Colors.text,
  },
  tooltipSub: {
    fontFamily: Fonts.jost,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
