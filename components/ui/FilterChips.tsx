import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export interface FilterOption {
  key: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  options: FilterOption[];
  /** Currently selected key, or null if "all" */
  selected: string | null;
  onSelect: (key: string | null) => void;
}

interface FilterChipsProps {
  groups: FilterGroup[];
}

export function FilterChips({ groups }: FilterChipsProps) {
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);

  return (
    <View>
      {/* Primary chips row — one chip per filter group */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {groups.map((group) => {
          const isActive = group.selected !== null;
          const activeOption = group.options.find((o) => o.key === group.selected);
          const displayLabel = activeOption ? activeOption.label : group.label;

          return (
            <TouchableOpacity
              key={group.id}
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.8}
              onPress={() =>
                setExpandedGroup(expandedGroup === group.id ? null : group.id)
              }
            >
              {group.icon ? (
                <Ionicons
                  name={group.icon}
                  size={14}
                  color={isActive ? '#fff' : Colors.text}
                />
              ) : null}
              <Text
                style={[styles.chipText, isActive && styles.chipTextActive]}
                numberOfLines={1}
              >
                {displayLabel}
              </Text>
              <Ionicons
                name={expandedGroup === group.id ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={isActive ? '#fff' : Colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Expanded options row */}
      {expandedGroup && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsRow}
        >
          {(() => {
            const group = groups.find((g) => g.id === expandedGroup);
            if (!group) return null;
            return (
              <>
                {/* "All" option */}
                <TouchableOpacity
                  style={[
                    styles.optionChip,
                    group.selected === null && styles.optionChipActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    group.onSelect(null);
                    setExpandedGroup(null);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      group.selected === null && styles.optionTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                {group.options.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.optionChip,
                      group.selected === opt.key && styles.optionChipActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      group.onSelect(
                        group.selected === opt.key ? null : opt.key
                      );
                      setExpandedGroup(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        group.selected === opt.key && styles.optionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            );
          })()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 12,
    color: Colors.text,
  },
  chipTextActive: {
    color: '#fff',
  },

  optionsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 8,
  },

  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.cardTintPurpleFaint || '#F3E8FF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontFamily: Fonts.jost,
    fontSize: 12,
    color: Colors.text,
  },
  optionTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.jostMedium,
  },
});
