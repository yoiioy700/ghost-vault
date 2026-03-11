import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Non-Custodial',
    // We'll reuse the default SVGs for now, or you can update them later
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        We never have access to your private keys or your funds. Everything is managed transparently via Starknet smart contracts.
      </>
    ),
  },
  {
    title: 'Gas-Efficient',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Built natively in Cairo 1.0 on Starknet, taking advantage of low-cost L2 transactions for maximum efficiency.
      </>
    ),
  },
  {
    title: 'Fully Customizable',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        You have complete control over the time-lock period, ensuring the Dead Man's Switch logic fits your specific needs perfectly.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
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
