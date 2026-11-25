import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FONT_FAMILIES } from '../tokens/typography';
import { ANIMATIONS } from '../tokens/animations';

interface HoldToConfirmButtonProps {
  label: string;
  onConfirmed: () => void;
}

export function HoldToConfirmButton({ label, onConfirmed }: HoldToConfirmButtonProps) {
  const { colors } = useTheme();
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const stopHold = useCallback(() => {
    setHolding(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setProgress(0);
  }, []);

  const startHold = useCallback(() => {
    setHolding(true);
    startTimeRef.current = Date.now();
    const tick = () => {
      const ratio = Math.min(1, (Date.now() - startTimeRef.current) / ANIMATIONS.holdConfirmMs);
      setProgress(ratio);
      if (ratio >= 1) {
        setHolding(false);
        rafRef.current = null;
        setProgress(0);
        onConfirmed();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onConfirmed]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <Pressable
      onPressIn={startHold}
      onPressOut={stopHold}
      onHoverOut={stopHold}
      style={{
        overflow: 'hidden',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.accentEmeraldBorder,
        backgroundColor: colors.accentEmeraldBg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${Math.round(progress * 100)}%`,
          backgroundColor: colors.accentEmerald,
          opacity: 0.35,
        }}
      />
      <Text
        style={{
          fontSize: 13,
          fontFamily: FONT_FAMILIES.sansSemiBold,
          color: colors.accentEmerald,
        }}
      >
        {holding ? `Đang giữ... ${Math.round(progress * 100)}%` : label}
      </Text>
    </Pressable>
  );
}
