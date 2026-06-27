import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MIN_SEARCH_KEYWORD_LENGTH, searchAddress } from "@/lib/api/buildings";
import { ApiError } from "@/lib/api/client";
import type { AddressSuggestion } from "@/types";
import { colors } from "@/theme/colors";

export interface SelectedBuilding {
  buildingId: number;
  label: string;
}

interface BuildingSearchPickerProps {
  value: SelectedBuilding | null;
  onChange: (value: SelectedBuilding | null) => void;
}

function resolveBuildingId(suggestion: AddressSuggestion): number | null {
  if (suggestion.buildingId != null) return suggestion.buildingId;
  if (suggestion.id && /^\d+$/.test(suggestion.id)) return Number(suggestion.id);
  return null;
}

export function BuildingSearchPicker({
  value,
  onChange,
}: BuildingSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (keyword: string) => {
    setQuery(keyword);
    setError(null);
    if (keyword.length < MIN_SEARCH_KEYWORD_LENGTH) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddress(keyword);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
      setError(e instanceof ApiError ? e.message : "건물 검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const buildingId = resolveBuildingId(suggestion);
    if (buildingId == null) {
      setError("선택한 건물 ID를 확인할 수 없습니다.");
      return;
    }
    onChange({
      buildingId,
      label: suggestion.roadAddress || suggestion.jibunAddress,
    });
    setQuery("");
    setSuggestions([]);
    setError(null);
  };

  if (value) {
    return (
      <View style={styles.selectedBox}>
        <Ionicons name="location" size={16} color={colors.saferoom[600]} />
        <View style={styles.selectedText}>
          <Text style={styles.selectedLabel}>{value.label}</Text>
          <Text style={styles.selectedSub}>건물 ID {value.buildingId}</Text>
        </View>
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.slate[400]} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>건물 검색</Text>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.slate[400]} />
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder="도로명·지번·동 이름 (2글자 이상)"
          style={styles.searchInput}
        />
      </View>
      {query.length > 0 && query.length < MIN_SEARCH_KEYWORD_LENGTH && (
        <Text style={styles.hint}>2글자 이상 입력해 주세요.</Text>
      )}
      {loading && <ActivityIndicator size="small" color={colors.saferoom[600]} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {suggestions.length > 0 && (
        <View style={styles.list}>
          {suggestions.map((item, index) => (
            <Pressable
              key={`${item.roadAddress}-${index}`}
              style={styles.item}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.itemTitle}>{item.roadAddress}</Text>
              {!!item.jibunAddress && (
                <Text style={styles.itemSub}>{item.jibunAddress}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handlePickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);
    if (date) onChange(formatDate(date));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dateRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          style={styles.dateInput}
        />
        <Pressable style={styles.calendarBtn} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar-outline" size={18} color={colors.slate[600]} />
        </Pressable>
      </View>
      <Text style={styles.hint}>직접 입력 또는 달력 아이콘으로 선택</Text>
      {showPicker && (
        <DateTimePicker
          value={parseDate(value)}
          mode="date"
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 12, fontWeight: "600", color: colors.slate[600] },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate[900],
  },
  hint: { fontSize: 11, color: colors.slate[400] },
  error: { fontSize: 12, color: colors.risk.danger },
  list: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 8,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
  },
  itemTitle: { fontSize: 14, color: colors.slate[900] },
  itemSub: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  selectedBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.saferoom[100],
    backgroundColor: colors.saferoom[50],
    borderRadius: 8,
    padding: 10,
  },
  selectedText: { flex: 1 },
  selectedLabel: { fontSize: 14, fontWeight: "600", color: colors.slate[900] },
  selectedSub: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  dateRow: { flexDirection: "row", gap: 8 },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate[900],
    backgroundColor: colors.white,
  },
  calendarBtn: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
