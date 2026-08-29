import React from "react"
import Box from '@site/src/components/ui/Box';
import Card from '@site/src/components/ui/Card';
import CardContent from '@site/src/components/ui/CardContent';
import Typography from '@site/src/components/ui/Typography';
import ExpandMoreIcon from '@site/src/components/ui/icons/ExpandMoreIcon';
import Accordion from '@site/src/components/ui/Accordion';
import AccordionSummary from '@site/src/components/ui/AccordionSummary';
import AccordionDetails from '@site/src/components/ui/AccordionDetails';

import Chip from '@site/src/components/ui/Chip';
import Stack from '@site/src/components/ui/Stack';

const linkSample = { "Udemy": "https://www.udemy.com/course/tensorflow-developer-certificate-machine-learning-zero-to-mastery/", "My Notes": "https://docs.google.com/document/d/1kP4wv0uMWKvrFWUlq66kVZnvnyb0km1AmkP65-dFJqQ/edit" }
const image = require("@site/static/img/2022-05-26-19-56-57.png").default
const image2 = require("../../static/img/2022-05-26-20-01-45.png").default



export default function CardDemo({ title = "", tags = ["Machine Learning", "Programming"], links = linkSample, image = image2, contentList = ["content1", "content2"] }) {

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>

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
                {image ? <img src={image} /> : ""}
            </CardContent>
            {contentList && contentList.length > 0 ?
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
                            {contentList.map(content => <ul>{content}</ul>)}
                        </Typography>
                    </AccordionDetails>
                </Accordion> : ""}
        </Card>
    )

}



