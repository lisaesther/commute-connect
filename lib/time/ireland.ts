const IRELAND_TIME_ZONE = "Europe/Dublin";

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const irelandFormatter = new Intl.DateTimeFormat(
  "en-IE",
  {
    timeZone: IRELAND_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  },
);

function getIrelandParts(
  timestamp: number,
): DateTimeParts {
  const parts =
    irelandFormatter.formatToParts(
      new Date(timestamp),
    );

  const values = Object.fromEntries(
    parts
      .filter(
        (part) => part.type !== "literal",
      )
      .map((part) => [
        part.type,
        part.value,
      ]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getIrelandOffset(
  timestamp: number,
) {
  const parts =
    getIrelandParts(timestamp);

  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return representedAsUtc - timestamp;
}

function matchesRequestedTime(
  timestamp: number,
  requested: DateTimeParts,
) {
  const actual =
    getIrelandParts(timestamp);

  return (
    actual.year === requested.year &&
    actual.month === requested.month &&
    actual.day === requested.day &&
    actual.hour === requested.hour &&
    actual.minute === requested.minute
  );
}

export function irelandLocalDateTimeToIso(
  dateValue: string,
  timeValue: string,
): string | null {
  const dateMatch =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      dateValue,
    );

  const timeMatch =
    /^(\d{2}):(\d{2})$/.exec(
      timeValue,
    );

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const requested: DateTimeParts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: 0,
  };

  const naiveUtc = Date.UTC(
    requested.year,
    requested.month - 1,
    requested.day,
    requested.hour,
    requested.minute,
  );

  const sampleTimes = [
    naiveUtc,
    naiveUtc - 24 * 60 * 60 * 1000,
    naiveUtc + 24 * 60 * 60 * 1000,
  ];

  const possibleOffsets = new Set(
    sampleTimes.map(
      getIrelandOffset,
    ),
  );

  const matchingTimestamps =
    Array.from(possibleOffsets)
      .map(
        (offset) =>
          naiveUtc - offset,
      )
      .filter((timestamp) =>
        matchesRequestedTime(
          timestamp,
          requested,
        ),
      );

  if (
    matchingTimestamps.length === 0
  ) {
    return null;
  }

  const selectedTimestamp = Math.min(
    ...matchingTimestamps,
  );

  return new Date(
    selectedTimestamp,
  ).toISOString();
}
