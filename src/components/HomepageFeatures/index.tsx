import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '前端',
    Svg: require('@site/static/img/work-hard.svg').default,
    description: (
      <>
        這是一個以前端為主的筆記，主要記錄了我在學習前端的過程中遇到的問題和解決方法，與一些軟體開發的知識。
      </>
    ),
  },
  {
    title: '閱讀',
    Svg: require('@site/static/img/read-book.svg').default,
    description: (
      <>
        這也是一個閱讀心得，閱讀後的輸出，才會讓我們真正的理解，轉化為自己的應用。
      </>
    ),
  },
  {
    title: '???',
    Svg: require('@site/static/img/more-creativity-universe.svg').default,
    description: (
      <>
        或許還有什麼想寫的東西，也會寫在這吧。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg viewBox='0 0 1024 1024' className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
