/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-array-index-key */
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Typography, Button, Divider, Tag } from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
import { useModel } from 'umi';
import styles from './index.less';
const { Title, Paragraph, Link } = Typography;
const { Meta } = Card;

const LabelsPreview: React.FC = (props) => {
  const { clickFunction } = props;
  const { labels } = useModel('welcome');
  return (
    <>
      <Divider orientation="left">
        筛选器 <strong>{labels?.length} prompt</strong>
      </Divider>
      {labels?.map((item, index) => {
        return (
          <Tag
            onClick={() => {
              clickFunction(item);
            }}
            key={index}
          >
            {item}
          </Tag>
        );
      })}
    </>
  );
};

type SearchProps = {
  label?: string;
};
const LabelsList: React.FC<SearchProps> = (props) => {
  const { tags,getTagsFunc } = useModel('welcome');
  useEffect(() => {
    getTagsFunc(props?.label )
  }, [props.label]);
  return (
    <>
      <Row gutter={16}>
        {tags?.map((item, index) => {
          return (
            <Col span={8} key={index}>
              <Card
                hoverable
                size="small"
                style={{ marginTop: 16 }}
                bodyStyle={{ height: 250 }}
                title={<span style={{ color: 'green' }}>{item.name}</span>}
                extra={<a href="#">More</a>}
              >
                <span style={{ fontSize: 'small' }}>{item.prompt}</span>
                <Meta
                  title={
                    <span
                      style={{
                        fontSize: 'small',
                        whiteSpace: 'pre-line',
                        position: 'absolute',
                        bottom: 50,
                      }}
                    >
                      {item.description}
                    </span>
                  }
                  description={
                    <span style={{ position: 'absolute', bottom: 10 }}>
                      {item.labels?.map((label, index) => {
                        return (
                          <span key={index}>
                            <Tag>{label}</Tag>
                          </span>
                        );
                      })}
                    </span>
                  }
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </>  
  )
};

const Welcome: React.FC = () => {
  const [searchLabel, setSearchLabel] = useState<string>();
  function onClickLabel(label: string) {
    setSearchLabel(label);
    console.log(label, 'Clicked! But prevent default.');
  }
  const searchLabelParam = useMemo(() => {
    return { key: searchLabel };
  }, [searchLabel]); // Don't forget the dependencies here either!
  return (
    <PageContainer>
      <Typography className={styles.center}>
        <Title>提高生产力，优化工作流程</Title>
        <Paragraph>
          公众号【小莓用AI】本站致力于研究探索AIGC应用。
          <Link href="/docs/spec/proximity">加入QQ群</Link>
        </Paragraph>
        <div style={{ textAlign: 'center' }}>
          <Button style={{ margin: '5px' }} type="primary" shape="round" size="large">
            开始对话
          </Button>
          <Button style={{ margin: '5px' }} type="default" shape="round" size="large">
            学习如何提问 👉
          </Button>
          <Button
            style={{ margin: '5px', background: '#00CC00' }}
            type="primary"
            shape="round"
            size="large"
          >
            赞赏 💸🙌🌟
          </Button>
        </div>
      </Typography>
      <LabelsPreview clickFunction={onClickLabel} />
      <Typography className={styles.center}>
        <Title level={5}>ChatGPT(AI对话)指令大全</Title>
      </Typography>
      <LabelsList label={searchLabelParam?.key} />
    </PageContainer>
  );
};

export default Welcome;
