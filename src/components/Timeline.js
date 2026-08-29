import * as React from 'react';
import Timeline from '@site/src/components/ui/lab/Timeline';
import TimelineItem from '@site/src/components/ui/lab/TimelineItem';
import TimelineSeparator from '@site/src/components/ui/lab/TimelineSeparator';
import TimelineConnector from '@site/src/components/ui/lab/TimelineConnector';
import TimelineContent from '@site/src/components/ui/lab/TimelineContent';
import TimelineDot from '@site/src/components/ui/lab/TimelineDot';

export default function BasicTimeline() {

// TImeline

  return (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>Eat</TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>Code</TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>Sleep</TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}
