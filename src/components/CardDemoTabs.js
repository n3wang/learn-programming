import React, { useState } from "react"
import Box from '@site/src/components/ui/Box';
import Card from '@site/src/components/ui/Card';
import CardContent from '@site/src/components/ui/CardContent';
import Typography from '@site/src/components/ui/Typography';
import ExpandMoreIcon from '@site/src/components/ui/icons/ExpandMoreIcon';
import Accordion from '@site/src/components/ui/Accordion';
import AccordionSummary from '@site/src/components/ui/AccordionSummary';
import AccordionDetails from '@site/src/components/ui/AccordionDetails';
import Tabs from '@site/src/components/ui/Tabs';
import Tab from '@site/src/components/ui/Tab';
import TabContext from '@site/src/components/ui/lab/TabContext';
import TabList from '@site/src/components/ui/lab/TabList';
import TabPanel from '@site/src/components/ui/lab/TabPanel';

import Chip from '@site/src/components/ui/Chip';
import Stack from '@site/src/components/ui/Stack';

const linkSample = { "Udemy": "https://www.udemy.com/course/tensorflow-developer-certificate-machine-learning-zero-to-mastery/", "My Notes": "https://docs.google.com/document/d/1kP4wv0uMWKvrFWUlq66kVZnvnyb0km1AmkP65-dFJqQ/edit" }
const image = require("@site/static/img/2022-05-26-19-56-57.png").default
const image2 = require("../../static/img/2022-05-26-20-01-45.png").default

export default function CardDemo({ title = "", tags = ["Machine Learning", "Programming"], links = linkSample }) {

    const [value, setValue] = React.useState(1);

    // const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    //     setValue(newValue);
    // };
    const handleChange = (newValue) => {
        setValue(newValue);
    };

    return (
        <Card sx={{ minWidth: 275 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChange} aria-label="lab API tabs example">
                            <Tab label="Item One" value="1" />
                            <Tab label="Item Two" value="2" />
                            <Tab label="Item Three" value="3" />
                        </TabList>
                    </Box>
                    <TabPanel value="1">Item One</TabPanel>
                    <TabPanel value="2">Item Two</TabPanel>
                    <TabPanel value="3">Item Three</TabPanel>
                </TabContext>
            </Box>
            {/* <CardContent>

                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    <Stack direction="row" spacing={1}>

                        {tags.map(tag => <Chip label={tag}></Chip>)}
                    </Stack>

                </Typography>
                <Typography variant="h5" component="div">{title}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {Object.keys(links).map(linkItem => {
                        return <span><a href={links[linkItem]} target="_blank" >{linkItem}</a>  | </span>
                    })}
                </Typography>
                <img src={image2} />
            </CardContent>

            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Content</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion> */}
        </Card>
    )

}



