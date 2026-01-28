"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createPreset, deletePreset } from "@/lib/actions/presets";
import type { Preset, PresetType } from "@/db/schema";
import { useTranslation } from "@/i18n/context";

interface PresetComboboxProps {
    presetType: PresetType;
    presets: Preset[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onPresetsChange?: () => void;
}

export function PresetCombobox({
    presetType,
    presets,
    value,
    onChange,
    placeholder,
    onPresetsChange,
}: PresetComboboxProps) {
    const { t } = useTranslation();
    const [isCustomInput, setIsCustomInput] = React.useState(false);
    const [customValue, setCustomValue] = React.useState("");
    const [isSaving, setIsSaving] = React.useState(false);

    // Default placeholder from translation
    const displayPlaceholder = placeholder || t("common.selectOrInput");

    // Check if current value is in presets
    const isValueInPresets = presets.some(p => p.value === value);

    const handleSelectChange = (selectedValue: string) => {
        if (selectedValue === "__custom__") {
            setIsCustomInput(true);
            setCustomValue(value);
        } else {
            onChange(selectedValue);
            setIsCustomInput(false);
        }
    };

    const handleCustomInputBlur = () => {
        if (customValue.trim()) {
            onChange(customValue.trim());
        }
    };

    const handleSaveAsPreset = async () => {
        if (!value.trim()) return;

        setIsSaving(true);
        try {
            await createPreset(presetType, value.trim());
            onPresetsChange?.();
            setIsCustomInput(false);
        } catch (error) {
            console.error("Failed to save preset:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePreset = async (e: React.MouseEvent, presetId: number) => {
        e.stopPropagation();
        try {
            await deletePreset(presetId);
            onPresetsChange?.();
        } catch (error) {
            console.error("Failed to delete preset:", error);
        }
    };

    if (isCustomInput) {
        return (
            <div className="flex gap-2">
                <Input
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onBlur={handleCustomInputBlur}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleCustomInputBlur();
                        } else if (e.key === "Escape") {
                            setIsCustomInput(false);
                            setCustomValue("");
                        }
                    }}
                    placeholder={displayPlaceholder}
                    autoFocus
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setIsCustomInput(false);
                        setCustomValue("");
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Select value={value || ""} onValueChange={handleSelectChange}>
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder={displayPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                    {/* Show current custom value if it's not in presets */}
                    {value && !isValueInPresets && (
                        <SelectItem value={value} className="font-medium">
                            {value}
                        </SelectItem>
                    )}
                    {presets.map((preset) => (
                        <SelectItem
                            key={preset.id}
                            value={preset.value}
                            className="flex items-center justify-between pr-8 relative"
                        >
                            <span>{preset.label || preset.value}</span>
                            {/* 只有真实的预设才能删除，虚拟预设（来自项目历史）不能删除 */}
                            {preset.id > 0 && (
                                <button
                                    type="button"
                                    className="absolute right-2 p-1 hover:bg-destructive/20 rounded"
                                    onClick={(e) => handleDeletePreset(e, preset.id)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                </button>
                            )}
                        </SelectItem>
                    ))}
                    <SelectItem value="__custom__" className="text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            {t("common.inputNewValue")}
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* Show save button when input value is not in presets */}
            {value && !isValueInPresets && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveAsPreset}
                    disabled={isSaving}
                    title={t("common.saveAsPreset")}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
