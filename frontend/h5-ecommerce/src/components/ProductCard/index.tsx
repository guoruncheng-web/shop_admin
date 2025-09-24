'use client';

import { Tag } from 'antd-mobile';
import { formatPrice } from '@/utils';
import styles from './index.module.less';
import clsx from 'clsx';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  tag?: string;
  className?: string;
  onClick?: (id: number) => void;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  tag,
  className,
  onClick,
}: ProductCardProps) {
  const hasDiscount = originalPrice && originalPrice > price;

  const handleClick = () => {
    onClick?.(id);
  };

  return (
    <div
      className={clsx(styles.card, className)}
      onClick={handleClick}
    >
      <div className={styles.imageContainer}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={image} 
            alt={name} 
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            📱
          </div>
        )}
        
        {tag && (
          <Tag 
            className={styles.tag} 
            color={tag === '热销' ? 'danger' : 'primary'}
            fill="solid"
          >
            {tag}
          </Tag>
        )}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.name} title={name}>
          {name}
        </h3>
        
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className={styles.originalPrice}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        
        {hasDiscount && (
          <div className={styles.discount}>
            省 {formatPrice(originalPrice - price)}
          </div>
        )}
      </div>
    </div>
  );
}